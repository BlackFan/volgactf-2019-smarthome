mqtt = require('mqtt');

var client;

clientConnect();



function clientConnect() {
	client = mqtt.connect({host: 'mqtt.volgactf-iot.pw',
			protocol: 'mqtts',
	        port: 8883,
	        path: '/',
	        clientId: 'VolgaCTF_IOT_flag1_d8c52c4a23792d11557cd8dc1b81a48b', 
	        username: 'ZDYIEXRNJ8oPXMQIHT2V', 
	        password: 'XGHd1wc8LYOUe5LZpTQB',
	        reconnectPeriod: 100000
	});
	setInterval(
		function() {client.reconnect();},
		9000
	);
}


client.on('connect', function () {
	console.log('connected');
})

client.on('close', function () {
	console.log('close');
})

client.on('offline', function () {
	console.log('offline');
})

client.on('error', function (error) {
	console.log('error ' + error);
})

client.on('end', function () {
	console.log('end');
})

client.on('message', function (topic, message) {
	console.log(topic, message.toString())
})