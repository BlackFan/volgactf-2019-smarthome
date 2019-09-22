<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/user';

    public function authenticated(Request $request, $user)
    {
        return response()->json([
            'result' => true,
            'user' => $user->name,
            'session' => session()->getId()
        ]);
    }

    public function login(Request $request)
    {
        if(!($request->exists($this->username()) and $request->exists('password') 
            and is_string($request->input($this->username())) and is_string($request->input('password')))) {
            
            return response()->json([ 
                'result' => false,
                'error' => 'Incorrect request'
            ]);
        }

        if ($this->attemptLogin($request)) {
            return $this->sendLoginResponse($request);
        }
        return response()->json([
            'result' => false,
            'error' => 'Incorrect username or password'
        ]);

    }

    public function username()
    {
        return 'name';
    }

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }
}
