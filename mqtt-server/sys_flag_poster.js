mqtt = require('mqtt');

var client;
var client2;

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
	setInterval(
		function() {
			client2 = mqtt.connect({host: 'mqtt.volgactf-iot.pw',
					protocol: 'mqtts',
			        port: 8883,
			        path: '/',
			        clientId: 'clientid_admin_d8edda89e361aeb90b11a04d12b2a805', 
			        username: 'admin', 
			        password: 'decead',
			        reconnectPeriod: 0
			});
						
			client2.on('connect', function () {
				client2._cleanUp(true);
			})
		},
		90000
	);
}