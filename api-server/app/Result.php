<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
	protected $hidden = ['updated_at']; 

    public function device()
    {
        return $this->belongsTo('App\Device');
    }
}
