<?php

namespace App\Http\Controllers;

use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use GuzzleHttp;

class MqttController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function mqtt()
    {
        $client = new GuzzleHttp\Client();
        $res = $client->request(
            'POST', 
            'https://mqtt.volgactf-iot.pw:8083/createUser', 
            [
                'headers' =>  [
                    'API-KEY' => 'Lxxd9EQoDdQuwHYALuDwaOmZAJxVMc4e'
                ],
                'json' => [
                    'username' => Auth::user()->name,
                    'subscribe' => Auth::user()->gateways()->pluck('gid')->toArray()
                ]
            ]
        );
        $result = ['result' => true] + json_decode($res->getBody(), true);
        return response()->json(
        	$result
        );
    }
}