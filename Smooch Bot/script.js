'use strict';

const _ = require('lodash');
var request = require('request');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say("Hi there!\nI’m your personal bot of AMC Mall. What would you like to do? %[Search Shops](postback:search_shops) %[CheckIn Car](postback:check_in) %[Message Helpdesk](postback:message_helpdesk)")
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {

                    //Check for Parking lot pattern 
                    var pattern = new RegExp("^[A][0-9]{1,3}?$");
                    var isParkingLotName = pattern.test(upperText);
                    console.log(isParkingLotName);

                    if (isParkingLotName) {
                        console.log("user id" + bot.userId);
                        console.log('https://azureenvironment.azurewebsites.net/api/v1/devices/checkin/' + upperText + '/' + bot.userId);
                        request('https://azureenvironment.azurewebsites.net/api/v1/devices/checkin/' + upperText + '/' + bot.userId, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                return bot.say('Done! you are checked-in.').then(() => 'speak');
                            }
                        })
                    }
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function (line) {
                    line = line.trim();
                    p = p.then(function () {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }
            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});