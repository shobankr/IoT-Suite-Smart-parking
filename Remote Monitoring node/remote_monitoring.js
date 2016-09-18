// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-http').Http;
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionStrings = [
  'HostName=azureenvironment.azure-devices.net;DeviceId=A11;SharedAccessKey=prG3dxdu8Ihel57X8cn1EQ=='
];


var parkStatus = Math.floor((Math.random() * 1) + 1);

var sendInterval = setInterval(function () {
  for (var i = 0; i < connectionStrings.length; i++) {
    var connectionString = connectionStrings[i];
    console.log("String : " + connectionString);
    console.log("Status : " + parkStatus);
    var deviceId = ConnectionString.parse(connectionString).DeviceId;

    var deviceMetaData = {
      'ObjectType': 'DeviceInfo',
      'IsSimulatedDevice': 0,
      'Version': '1.0',
      'DeviceProperties': {
        'MessengerUser': '',
        'DeviceID': deviceId,
        'HubEnabledState': 1,
        'CreatedTime': '2015-09-21T20:28:55.5448990Z',
        'DeviceState': 'normal',
        'UpdatedTime': null,
        'Manufacturer': 'Contoso Inc.',
        'ModelNumber': 'MD-909',
        'SerialNumber': 'SER9090',
        'FirmwareVersion': '1.10',
        'Platform': 'node.js',
        'Processor': 'ARM',
        'InstalledRAM': '64 MB',
        'Latitude': 47.617025,
        'Longitude': -122.191285
      },
      'Commands': []
    };
    // Create IoT Hub client
    var client = Client.fromConnectionString(connectionString, Protocol);

    client.open(function (err, result) {
      if (err) {
        printErrorFor('open')(err);
      } else {

        console.log('Sending device metadata:\n' + JSON.stringify(deviceMetaData));
        client.sendEvent(new Message(JSON.stringify(deviceMetaData)), printErrorFor('send metadata'));

        client.on('message', function (msg) {
          console.log('receive data: ' + msg.getData());
        });


        var data = JSON.stringify({
          'ParkStatus': parkStatus,
        });

        //console.log('Sending device event data:\n' + data);

        client.sendEvent(new Message(data), printErrorFor('send event'));


        client.on('error', function (err) {
          printErrorFor('client')(err);
          if (sendInterval) clearInterval(sendInterval);
          client.close();
        });
      }
    });
  }
}, 5000);

// Helper function to print results for an operation
function printErrorFor(op) {
  return function printError(err) {
    if (err) console.log(op + ' error: ' + err.toString());
  };
}




