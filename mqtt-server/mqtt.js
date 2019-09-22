var mosca = require('mosca');
var mongoose = require('mongoose');
var User = require('./model/user');
var md5 = require('md5');
var generatePassword = require('password-generator');

var https = require('https');
var fs = require('fs');
var port = 8083;
var SERVER_API_KEY = 'Lxxd9EQoDdQuwHYALuDwaOmZAJxVMc4e';

var options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./fullchain.pem')
}; 
 
var httpServer = https.createServer(options);
httpServer.on('request', function(request, response) {
    response.writeHead(200);
    switch(request.url) {
      case '/createUser':
        var apikey = request.headers['api-key'];
        if(apikey != SERVER_API_KEY) {
          response.writeHead(200, {'Content-Type': 'application/json'})
          response.end('{"error":"Incorrect API KEY"}');  
          break;        
        }
        if(request.method == 'POST') {
          var body = ''
          request.on('data', function(data) {
            body += data
          })
          request.on('end', function() {
            try {
              json = JSON.parse(body);
            } catch (e) {
              json = {};
            }
            if((typeof json.username == 'string') && (Array.isArray(json.subscribe))) {
              var subscribe = JSON.stringify(json.subscribe);
              var username = json.username;
              var password = generatePassword(6, false, /[a-f\d]/);
              var userData = {'clientid':'clientid_'+username+'_'+md5(password), 'username':username, 'password':password, 'type':'mobile', 'subscribe':subscribe};
              response.writeHead(200, {'Content-Type': 'application/json'});
              User.create(userData, function (error, user) {
                if (error) {
                  response.end('{"error":"Something wrong"}');
                } else {
                  response.end(JSON.stringify(userData));
                }
              })
            } else {
              response.writeHead(200, {'Content-Type': 'application/json'})
              response.end('{"error":"Incorrect reqest"}');  
            }
          })
        } else {
          response.writeHead(200, {'Content-Type': 'application/json'})
          response.end('{"error":"Incorrect reqest"}'); 
        }
      break;

      default:
        response.writeHead(200, {'Content-Type': 'text/plain'})
        response.end('MQTT Server');
      break;
    }
});

/* MongoDB */
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://mongo:XXX@localhost/mqtt-users', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){console.log('mongodb connected');});
/* MongoDB */
 
/* MQTT */
var ascoltatore = {
  type: 'redis',
  redis: require('redis'),
  db: 1,
  port: 6379,
  return_buffers: true,
  host: "localhost",
  password: "XXX"
};
 
var settings = {
  secure: {
    port: 8883,
    keyPath: './privkey.pem',
    certPath: './fullchain.pem'
  },
  backend: ascoltatore
};

var mqttServer = new mosca.Server(settings);
mqttServer.attachHttpServer(httpServer, '/mqtt');
httpServer.listen(port);
/* MQTT */

function createDefaultUsers() {
    var userData = [
      {clientid: "gateway01",username: "gateway01",password: "c0478ff243512bbc",type:     "gateway",subscribe:  "[\"admin\"]"},
      {clientid: "gateway02",username: "gateway02",password: "1e45401b2c1c9108",type:     "gateway",subscribe:  "[\"user\"]"},
      {clientid: "gateway02_zigbee",username: "gateway02",password: "1e45401b2c1c9108",type:     "gateway",subscribe:  "[\"user\"]"},
      {clientid: "VolgaCTF_IOT_flag1_d8c52c4a23792d11557cd8dc1b81a48b",username:"ZDYIEXRNJ8oPXMQIHT2V",password:"XGHd1wc8LYOUe5LZpTQB",type:"gateway",subscribe:"[]"},
      {clientid: "clientid_admin_d8edda89e361aeb90b11a04d12b2a805",username:"admin",password:"decead",type:"mobile",subscribe:"[\"gateway01\"]"}
    ]

    User.create(userData, function (error, user) {
      if (error) {
        console.log('error', error);
      } else {
        console.log('User created');
      }
    })
}
//createDefaultUsers();
 
mqttServer.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});
mqttServer.on('published', function(packet, client) {
  console.log('Published', packet.payload);
});
mqttServer.on('ready', setup);

var authenticate = function(client, username, password, callback) {
  User.authenticate(client.id, username, password, function (error, user) {
      if (error || !user) {
        callback(null, false);
      } else {
        client.user = username;
        client.type = user.type;
        client.subscribe = JSON.parse(user.subscribe);
        callback(null, true);
      }
  });
}

var authorizePublish = function(client, topic, payload, callback) {
  topic = topic.split('/');
  if(client.type == 'mobile') {
    if(topic[0] == 'mobile') {
      callback(null, (topic[1] == client.user) && (topic[2] == client.id));
      return;
    }
  } else {
    if(topic[0] == 'gateway') {
      callback(null, topic[1] == client.user);
      return;
    }
  }
  callback(null, false);
}

var authorizeSubscribe = function(client, topic, callback) {
  topic = topic.split('/');
  if(client.type == 'mobile') {
    if(topic[0] == 'gateway') {
      callback(null, client.subscribe.includes(topic[1]) && ((client.id == topic[2]) || ('global' == topic[2])));
      return;
    }
  } else {
    if(topic[0] == 'mobile') {
      callback(null, client.subscribe.includes(topic[1]));
      return;
    }
    if(topic[0] == 'gateway') {
      callback(null, topic[1] == client.user);
      return;
    }
  }
  if(topic[0] == '$SYS') {
    callback(null, true);
    return;
  }
  callback(null, false);
}
 
function setup() {
  mqttServer.authenticate = authenticate;
  mqttServer.authorizePublish = authorizePublish;
  mqttServer.authorizeSubscribe = authorizeSubscribe;
  console.log('Mosca server is up and running');
}
