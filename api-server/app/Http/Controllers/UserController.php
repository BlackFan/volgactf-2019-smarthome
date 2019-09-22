<?php

namespace App\Http\Controllers;

use App\User;
use App\Device;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use \Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function user()
    {
        return response()->json(
        	[
            	'result' => true,
	        	'name' => Auth::user()->name, 
	        	'gateways' => Auth::user()->gateways()->with('devices')->get()
        	]
            +
            ['flag' => (Auth::user()->name === 'admin') ? 'VolgaCTF_IOT_flag9_82921e79b30ce405e7bba169ce41b335' : 'Admin Only']
        );
    }

    public function device($id)
    {
        if(!Auth::user()->devices->contains('id', $id)) {
            return response()->json(['result' => false, 'error' => 'Device does not belong to the user']);
        }
        $device = Device::with(array('results' => function($query) {
            $query->orderBy('created_at', 'DESC');
        }))->find($id);
        if((!$device->results->isEmpty()) and ($device->type === 'camera')) {
            $device->last = Storage::disk('s3')->temporaryUrl(
                $device->results->sortByDesc('created_at')->first()->text, 
                now()->addMinutes(60)
            );
            $device->last = Str::replaceFirst('https://'.env('AWS_BUCKET').'.s3.'.env('AWS_DEFAULT_REGION').'.amazonaws.com', env('AWS_URL'), $device->last);
        } else {
            $device->last = 'img/empty.png';
        }
        return response()->json(
            ['result' => true, 'device' => $device]
        );
    }
}