<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert(
        	[[
	            'name' => 'admin',
	            'password' => bcrypt('7n876y35171'),
	            'created_at' => Carbon::now(),
	            'updated_at' => Carbon::now(),
	        ],
        	[
	            'name' => 'user',
	            'password' => bcrypt('user'),
	            'created_at' => Carbon::now(),
	            'updated_at' => Carbon::now(),
	        ]]
        );

        DB::table('gateways')->insert(
            [[
                'gid' => 'gateway01',
                'user_id' => 1,
                'username' => 'gateway01',
                'password' => 'c0478ff243512bbc',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'gid' => 'gateway02',
                'user_id' => 2,
                'username' => 'gateway02',
                'password' => '1e45401b2c1c9108',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]]
        );

        DB::table('devices')->insert(
            [[
                'name' => 'Camera',
                'type' => 'camera',
                'did' => '',
                'gateway_id' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Camera',
                'type' => 'camera',
                'did' => '',
                'gateway_id' => 2,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Sensor',
                'type' => 'sensor',
                'did' => '0x00158d0002456af9',
                'gateway_id' => 2,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]]
        );

    }
}
