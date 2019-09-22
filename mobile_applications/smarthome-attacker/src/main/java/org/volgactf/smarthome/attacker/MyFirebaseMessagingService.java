package org.volgactf.smarthome.attacker;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.volgactf.smarthome.attacker.MainActivity;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "MyFirebaseMsgService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            if(remoteMessage.getData().containsKey("url")) {
                String url = remoteMessage.getData().get("url");
                Intent intent = new Intent("android.intent.action.VIEW");
                intent.addCategory("android.intent.category.BROWSABLE");
                intent.setData(Uri.parse(url));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                this.getApplicationContext().startActivity(intent);
            }
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);
        sendRegistrationToServer(token);
    }

    private void sendRegistrationToServer(String token) {
        new AsyncTask<String, String, String>() {
            @Override
            protected String doInBackground(String... params) {
                String s = "";
                String token = params[0];
                try {
                    s = MainActivity.doGet("https://api.volgactf-iot.pw/register-attacker/ZNSKFQVUpeDJYA1YFSII?token="+token);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return s;
            }
        }.execute(token);
    }
}