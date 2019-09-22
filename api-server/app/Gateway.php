<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Gateway extends Model
{
	protected $hidden = ['created_at', 'updated_at', 'username', 'password']; 
	
    public function user()
    {
        return $this->belongsTo('App\User');
    }

    public function devices()
    {
        return $this->hasMany('App\Device');
    }
}
