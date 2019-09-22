<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
	protected $hidden = ['laravel_through_key', 'created_at', 'updated_at']; 

    public function gateway()
    {
        return $this->belongsTo('App\Gateway');
    }

    public function results()
    {
        return $this->hasMany('App\Result');
    }
}
