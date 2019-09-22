<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Device;
use Carbon\Carbon;
use \Storage;

class ClearUserPhoto extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clear:photo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $adminCamera = Device::find(2);
        $results = $adminCamera->results()->get();
        foreach($results as $r) {
            Storage::disk('s3')->delete($r->text);
            $r->delete();
        }
    }
}
