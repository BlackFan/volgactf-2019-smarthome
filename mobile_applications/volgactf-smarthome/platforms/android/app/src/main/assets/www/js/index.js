const API_HOST  = 'https://api.volgactf-iot.pw';
const MQTT_HOST = 'wss://mqtt.volgactf-iot.pw:8083/mqtt';
const MAIN_HOST = 'https://volgactf-iot.pw';
const FLAG      = 'VolgaCTF_IOT_flag8_43d454e212e945c98fc2bb3b5c57daaf';
var mqttClient;

$(document).ready(function() {
   
    $(document).bind('deviceready', onDeviceReady);

    function getRequest(url, success) {
        cordova.plugin.http.get(API_HOST + url, 
            {},
            {'Cookie': 'iot_session=' + getSession()}, 
            function(response) {
                json = JSON.parse(response.data);
                if(!json.result) {
                    renderLogin({error: json.error, type: 'danger'});
                } else {
                    success(json);
                }
            }, function(response) {
                renderLogin({error: 'Internet connection error', type: 'danger'});
            }
        );
    }

    function getSession() {
        return window.localStorage.getItem('iot_session');
    }

    function getUsername() {
        return window.localStorage.getItem('username');
    }

    function getMQTTClientId() {
        return window.localStorage.getItem('clientid');
    }

    function getGateways() {
        return JSON.parse(window.localStorage.getItem('gateways'));
    }

    function getDevice(id) {
        devices = JSON.parse(window.localStorage.getItem('devices'));
        return devices[id];
    }

    function button(id, callback) {
        $('#render').off('click', id).on('click', id, callback);
    }

    function toast(message) {
        navigator.notification.beep(1);
        window.plugins.toast.showShortTop(message, function(a){}, function(b){});
    }

    function mqttInit(client, clientid) {
        client.on('connect', function () {
            getGateways().forEach(function(element) {
              client.subscribe('gateway/' + element + '/' + clientid, function (err) {});
              client.subscribe('gateway/' + element + '/global', function (err) {});
            });
            mqttPublish({cmd: 'message', text: 'Client connected'});
        });

        client.on('message', function (topic, message) {
            command = JSON.parse(message);
            switch(command.cmd) {
                case 'photo':
                    renderDevice(command.device_id);
                    toast('New photo on ' + getDevice(command.device_id).name);
                break;
                case 'result':
                    toast('New result on ' + getDevice(command.device_id).name);
                break;
                case 'message':
                    toast(command.text);
                break;
            }
        });

        client.on('error', function (error) {
            console.log('Error: ' + error);
        })
    }

    function mqttPublish(cmd) {
        mqttClient.publish('mobile/' + getUsername() + '/' + getMQTTClientId(), JSON.stringify(cmd));
    }

    function renderLogin(data) {
        $('#render').html($('#loginTpl').render(data));
        $(document).off('backbutton');
    }

    function renderGateway() {
        getRequest('/user', function(result) {
            devices = [];
            result.gateways.forEach(function(gateway) {
                gateway.devices.forEach(function(device) {
                    devices[device.id] = device;
                });
            });
            window.localStorage.setItem('devices', JSON.stringify(devices));
            $('#render').html($('#gatewayTpl').render(result)); 
        });

        if(mqttClient == null || !mqttClient.connected) {
            getRequest('/mqtt', function(result) {
                window.localStorage.setItem('clientid', result.clientid);
                window.localStorage.setItem('username', result.username);
                window.localStorage.setItem('gateways', result.subscribe);

                mqttClient = mqtt.connect(MQTT_HOST, {
                    clientId: result.clientid, username: result.username, password: result.password
                });
                mqttInit(mqttClient, result.clientid);
            });
        }

        $(document).off('backbutton');
        button('#device', function() { renderDevice($(this).data('id')); });
    }

    function renderDevice(id) {
        getRequest('/device/' + id, function(result) {
            device = json.device;
            switch(device.type) {
                case 'sensor':
                    $('#render').html($('#sensorTpl').render(device));
                    break;

                case 'camera':
                    $('#render').html($('#cameraTpl').render(device));
                    $('#mainImage').on('load', function() {
                        $(this).attr('src', $(this).data('src'));
                    });
                    break;
            }
        });

        $(document).bind('backbutton', renderGateway);

        button('#refresh', function() { renderDevice(id); });
        button('#photo', function() { mqttPublish({cmd: 'photo', device_id: id}); });
        button('#image', function() {
            getRequest('/cloud/sign?file=' + $(this).data('file'), function(result) {
                $('#mainImage').attr('src', 'img/spinner.gif').data('src', result.link).on('load', function() {;
                    $(this).attr('src', $(this).data('src'));
                });
            });
        });
    }

    function onDeviceReady() {
        if (getSession() !== null)
            renderGateway();
        else
            renderLogin({showError: 'd-none'});

        window.plugins.webintent.getUri(urlScheme);
        window.plugins.webintent.onNewIntent(urlScheme);
    }

    function urlScheme(uri) {
        if(uri != '' && uri != null) {
            intentUri = new URL(uri);
            url = intentUri.searchParams.get('url');
            if((url != null)/* && (url.startsWith(MAIN_HOST))*/) {
                cordova.InAppBrowser.open(url + '#' + FLAG, '_blank', 'location=yes');
            }
        }
    }

    button('#login', function() { 
        cordova.plugin.http.post(API_HOST + '/login',
            {'name' : $('#username').val(), 'password' : $('#password').val()}, 
            {'Content-Type': 'application/json'}, 
            function(response) {
                json = JSON.parse(response.data);
                if(!json.result) {
                    renderLogin({username:name, password:password, error: json.error, type: 'danger'});
                } else {
                    window.localStorage.setItem('iot_session', json.session);
                    renderGateway();
                }
            }, function(response) {
                renderLogin({username:name, password:password, error: 'Internet connection error', type: 'danger'});
            }
        );
    });
});