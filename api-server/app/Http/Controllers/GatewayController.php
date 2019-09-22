<?php

namespace App\Http\Controllers;

use App\Result;
use App\Gateway;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use \Storage;
use Illuminate\Support\Str;

class GatewayController extends Controller
{
    public function __construct()
    {
        $this->middleware('gateway.auth');
    }
    
    public function upload(Request $request)
    {
        $gateway = $this->getAuthGateway($request);
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:2048',
            'device_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'result' => false,
                'error' => 'Incorrect request'
            ]);
        }

        if(!$this->getAuthGateway($request)->devices->contains('id', $request->input('device_id'))) {
            return response()->json(['result' => false, 'error' => 'Device does not belong to the gateway']);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $deviceId = $request->input('device_id');
            $name = Str::random(32);
            $filePath = $gateway->gid . '/' . $deviceId . '/' . $name . '.png';
            Storage::disk('s3')->put($filePath, file_get_contents($file));

            $result = new Result();
            $result->text = $filePath;
            $result->device_id = $deviceId;
            $result->save();

            return response()->json([
                'result' => true,
                'object' => $filePath
            ]); 
        }
    }
    
    public function result(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string',
            'device_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'result' => false,
                'error' => 'Incorrect request'
            ]);
        }

        if(!$this->getAuthGateway($request)->devices->contains('id', $request->input('device_id'))) {
            return response()->json(['result' => false, 'error' => 'Device does not belong to the gateway']);
        }
        $result = new Result();
        $result->text = $request->input('text');
        $result->device_id = $request->input('device_id');
        $result->save();
        return response()->json(['result' => true]);
    }

    public function gateway(Request $request)
    {
        $gateway = $this->getAuthGateway($request);
        return response()->json([
            'result' => true,
            'gateway' => $gateway
        ]);
    }

    private function getAuthGateway($request) {
        list($username, $password) = explode(':', base64_decode(explode(' ', $request->header('Authorization'))[1]));
        $gateway = Gateway::with('user')->with('devices')->where('username', $username)->where('password', $password)->first();
        return $gateway;
    }
}