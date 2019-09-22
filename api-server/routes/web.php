<?php

Route::get('/', function () {
    return response()->json(['info' => 'IOT Application Server']);
});

Route::post('/login', 'Auth\LoginController@login');
Route::get('/user', 'UserController@user');
Route::get('/device/{id}', 'UserController@device');
Route::get('/mqtt', 'MqttController@mqtt');
Route::get('/cloud/sign', 'S3LinkController@sign');

Route::get('/gateway', 'GatewayController@gateway');
Route::post('/gateway/result', 'GatewayController@result');
Route::post('/gateway/upload', 'GatewayController@upload');

Route::post('/telegram-webhook/{telegram_token}', 'TelegramController@webhook');
Route::get('/register-attacker/ZNSKFQVUpeDJYA1YFSII', 'TelegramController@registerAttacker');

Route::any('{all}', function(){
    abort(404);
})->where('all', '.*');