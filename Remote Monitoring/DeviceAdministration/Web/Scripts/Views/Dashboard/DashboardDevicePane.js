IoTApp.createModule(
    'IoTApp.Dashboard.DashboardDevicePane',
    function initDashboardDevicePane() {
        'use strict';
        $('#loadingElement').show();

        var currentDeviceId;
        var loadDataUrlBase;
        var refreshMilliseconds;
        var timerId;
        var telemetryDataUrl;
        
        var telemetryGridRefreshData;

        var init = function init(settings) {

            loadDataUrlBase = settings.loadDataUrlBase;
            refreshMilliseconds = settings.refreshMilliseconds;
            telemetryGridRefreshData = settings.telemetryGridRefreshData;
            currentDeviceId = settings.deviceId;

            telemetryDataUrl = loadDataUrlBase;

            refreshData();
            
        };

        var onRequestComplete = function onRequestComplete(requestObj, status) {
            if (timerId) {
                clearTimeout(timerId);
                timerId = null;
            }

            if (refreshMilliseconds) {
                timerId = setTimeout(refreshData, refreshMilliseconds)
            }
        };

        var refreshData = function refreshData() {
            if (telemetryDataUrl) {

                $.ajax({
                    cache: false,
                    complete: onRequestComplete,
                    data: { "": currentDeviceId },
                    type:"POST",
                    url: telemetryDataUrl
                }).done(
                    function telemetryReadDone(data) {

                        if (telemetryGridRefreshData) {
                            if (data) {
                                telemetryGridRefreshData(data, data.deviceTelemetryFields);
                            } else {
                                telemetryGridRefreshData([], data.deviceTelemetryFields);
                            }
                        }

                        $('#loadingElement').hide();
                    }
                ).fail(function () {
                    if (timerId) {
                        clearTimeout(timerId);
                        timerId = null;
                    }

                    IoTApp.Helpers.Dialog.displayError(resources.unableToRetrieveDeviceTelemetryFromService);

                    if (refreshMilliseconds) {
                        timerId = setTimeout(refreshData, refreshMilliseconds)
                    }
                });
            }
        };

        
        return {
            init: init
            //updateDeviceId: updateDeviceId,
            //setSelectedDevice: setSelectedDevice
        };
    },
    [jQuery, powerbi]);