<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Str;
use App\Gateway;


class GatewayAuth
{
    public function handle($request, Closure $next)
    {
        if(Str::startsWith($request->header('Authorization'), 'Basic ')) {
            list($username, $password) = explode(':', base64_decode(explode(' ', $request->header('Authorization'))[1]));
            $gateway = Gateway::where('username', $username)->where('password', $password)->first();
            if($gateway == null) {
                return response()->json([
                    'result' => false,
                    'error' => 'Unauthorized'
                ]);
            }
            return $next($request);
        } else {
            return response()->json([
                'result' => false,
                'error' => 'Unauthorized'
            ]);
        }
    }
}