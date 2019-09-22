<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;

class User extends Authenticatable
{
	protected $hidden = ['created_at', 'updated_at', 'username', 'password']; 
	
    public function gateways()
    {
        return $this->hasMany('App\Gateway');
    }

    public function devices()
    {
        return $this->hasManyThrough('App\Device', 'App\Gateway');
    }
}
