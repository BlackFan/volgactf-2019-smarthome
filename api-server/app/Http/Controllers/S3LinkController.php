<?php

namespace App\Http\Controllers;

use App\Result;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use \Storage;
use Illuminate\Support\Str;

class S3LinkController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function sign(Request $request)
    {
        if ($request->has('file') and is_string($request->input('file'))) {
            if(empty($this->removeDots($request->input('file')))) {
                return response()->json([
                    'result' => false,
                    'error' => 'Hacking attempt'
                ]);
            }
            $url = Storage::disk('s3')->temporaryUrl(
                $request->input('file'), 
                now()->addMinutes(60)
            );
            $url = Str::replaceFirst('https://'.env('AWS_BUCKET').'.s3.'.env('AWS_DEFAULT_REGION').'.amazonaws.com', env('AWS_URL'), $url);
            return response()->json([
                'result' => true,
                'link' => $url
            ]);
        } else {
            return response()->json([
                'result' => false,
                'error' => 'Incorrect request'
            ]);
        }
    }

    private function removeDots($path) {
        $root = ($path[0] === '/') ? '/' : '';

        $segments = explode('/', trim($path, '/'));
        $ret = array();
        foreach($segments as $segment){
            if (($segment == '.') || strlen($segment) === 0) {
                continue;
            }
            if ($segment == '..') {
                array_pop($ret);
            } else {
                array_push($ret, $segment);
            }
        }
        return $root . implode('/', $ret);
    }
}