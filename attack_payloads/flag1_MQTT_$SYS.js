mqtt = require('mqtt');

var client  = mqtt.connect({host: 'mqtt.volgactf-iot.pw',
		protocol: 'mqtts',
        port: 8883,
        path: '/',
        clientId: 'clientid_user_526b14197252d44448df004c90652d52', 
        username: 'user', 
        password: '912a5b',
    });

client.on('connect', function () {
	console.log('connected');
	client.subscribe('$SYS/#', function (err) {})
})

client.on('message', function (topic, message) {
  console.log(topic, message.toString())
})