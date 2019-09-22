mqtt 		= require('mqtt');
querystring = require('querystring');
request 	= require('request');
fs 			= require('fs');
piCamera 	= require('pi-camera');
config 		= require('./config');

var gateway = config.gateway;
var password = config.password;
var mqttClient;
var devices;

console.log('Gateway ' + gateway + ' started');
console.log('Check credentials');

request.get({url: config.apiHost + '/gateway', auth: {user: gateway, pass: password}}, 
	function optionalCallback(err, httpResponse, body) {
		if (err) {
			return console.error('Error /gateway request ' + err);
		}
		result = JSON.parse(body);
		if(result.result) {
			devices = result.gateway.devices;
			mqttInit(gateway, password, result.gateway.user.name, devices);
		}
	}
);	

function mqttPublish(client_id, cmd) {
	mqttClient.publish('gateway/' + gateway + '/' + client_id, JSON.stringify(cmd));
}

function mqttInit(username, password, subscribe, devices) {
	mqttClient  = mqtt.connect({host: config.mqttHost,
			protocol: 'mqtts',
	        port: 8883,
	        path: '/',
	        clientId: gateway, username: gateway, password: password,
	    });

	mqttClient.on('connect', function () {
		console.log('MQTT connected, subscribe to mobile/' + subscribe);
		mqttClient.subscribe('mobile/' + subscribe + '/+', function (err) {});

		devices.forEach(function(device) {
			if(device.did != '') {
				mqttClient.subscribe('gateway/' + username + '/' + device.did, function (err) {});
			}
		});
	})

	mqttClient.on('close', function () {
		console.log('MQTT close');
	})

	mqttClient.on('offline', function () {
		console.log('MQTT offline');
	})

	mqttClient.on('error', function (error) {
		console.log('MQTT error ' + error);
	})

	mqttClient.on('end', function () {
		console.log('MQTT end');
	})

	mqttClient.on('message', function (topic, message) {
		console.log('MQTT get message topic=' + topic + ' message=' + message);
		topic = topic.split('/');
		client_id = topic[2];
	  	command = JSON.parse(message);
	  	if(topic[0] == 'gateway') {
			device = devices.find(function(device) {
				return device.did == topic[2];
			});
	  		motionSensor(device.id, command);
	  	} else {
			switch(command.cmd) {
			  	case 'photo': 
			  		photo(client_id, command);
			  		break;
			  	case 'get_flag': 
			  		mqttPublish(client_id, {'cmd': 'message', 'text': config.FLAG_1});
			  		break;
			}
	  	}
	})
}

function photo(client_id, command) {
  	console.log('Take a photo');

  	image = this.config.camera.filename ? this.config.camera.filename : '/home/pi/gateway/images/output.jpg';
  	camera = new piCamera({
		mode: 'photo',
		output: image,
		width: 640,
		height: 480,
		nopreview: true,
	});

	camera.snap()
		.then((result) => {
			formData = {
				device_id: command.device_id,
				image: fs.createReadStream(image),
			};
			request.post({url:config.apiHost + '/gateway/upload', auth: {user: gateway, pass: password}, formData: formData}, 
				function optionalCallback(err, httpResponse, body) {
					if (err) {
					   	return console.error('Upload photo failed: ', err);
					}
					result = JSON.parse(body);
					if(result.result) {
				  		merge(result, command);
				  		mqttPublish(client_id, result);
					} else {
				  		mqttPublish(client_id, {'cmd': 'message', 'text': result.error});
					}
				}
			);
		})
		.catch((err) => {
			mqttPublish(client_id, {'cmd': 'message', 'text': 'Camera error'});
			console.error('Camera error: ', err);
			setTimeout(function() {process.exit(1);}, 1000);
		});
}

function motionSensor(deviceId, message) {
	if(message.occupancy) {
		text = 'Motion Detected';
	  	mqttPublish('global', {'cmd': 'result', 'device_id': deviceId, 'text': text});
		request.post({url:config.apiHost + '/gateway/result', auth: {user: gateway, pass: password}, json: {device_id: deviceId, text: text.toString()}}, 
			function optionalCallback(err, httpResponse, body) {
				if (err) {
				   	return console.error('New result failed: ', err);
				}
			}
		);
		camera = devices.find(function(device) {
			return device.type == 'camera';
		});
		photo('global', {cmd: 'photo', device_id: camera.id});
	}
}

function merge(obj1, obj2) {
	for (var attr in obj2) { 
		if(attr === '__proto__') continue;
		if(typeof obj2[attr] == 'object') 
			merge(obj1[attr], obj2[attr]); 
		obj1[attr] = obj2[attr]; 
	}
}