<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Longman\TelegramBot\Telegram;
use Longman\TelegramBot\Request as TGRequest;
use Illuminate\Support\Facades\Validator;
use App\Attacker;
use LaravelFCM\Message\OptionsBuilder;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
use FCM;

class TelegramController extends Controller
{

    public function webhook(Request $request, $telegram_token)
    {
        try {
            if(env('TELEGRAM_TOKEN') === $telegram_token) {
                $telegram = new Telegram(env('TELEGRAM_TOKEN'), env('TELEGRAM_BOT'));
                $validator = Validator::make($request->all(), [
                    'message.text' => 'url'
                ]);
                if($request->input('message.text') === '/start') {
                    $result = TGRequest::sendMessage([
                        'chat_id' => $request->input('message.chat.id'),
                        'text'    => 'Hi, I\'m the admin of VolgaCTF SmartHome. Here you can send me some interesting links.',
                    ]); 
                } elseif(!$validator->fails()) {

                    $result = TGRequest::sendMessage([
                            'chat_id' => $request->input('message.chat.id'),
                            'text'    => 'Ok i\'ll check it soon',
                        ]);

                    $attackers = Attacker::all();
                    foreach ($attackers as $attacker) {
                        $optionBuilder = new OptionsBuilder();
                        $optionBuilder->setTimeToLive(60*20);
                        $dataBuilder = new PayloadDataBuilder();
                        $dataBuilder->addData(['url' => $request->input('message.text')]);
                        $option = $optionBuilder->build();
                        $data = $dataBuilder->build();
                        $token = $attacker->token;
                        $downstreamResponse = FCM::sendTo($token, $option, null, $data);
                        $deleteTokens = $downstreamResponse->tokensToDelete();
                        Attacker::whereIn('token', $deleteTokens)->delete();
                        foreach($downstreamResponse->tokensToModify() as $oldToken => $newToken) {
                            $modifyAttacker = Attacker::where('token', '=', $oldToken);
                            $modifyAttacker->token = $newToken;
                            $modifyAttacker->save();
                        }
                    }
                } else {
                    $result = TGRequest::sendMessage([
                        'chat_id' => $request->input('message.chat.id'),
                        'text'    => 'It does not look like a link',
                    ]); 
                }
            }
        } catch (Longman\TelegramBot\Exception\TelegramException $e) {
            Log::info($e);
        }
    }

    public function registerAttacker(Request $request)
    {
        if($request->has('token') && !Attacker::where('token', '=', $request->input('token'))->exists()) {
            $attacker = new Attacker();
            $attacker->token = $request->input('token');
            $attacker->save();
        }
    }
}