<?php

namespace App\Http\Controllers;

use Google_Client;
use Google_Service_Drive;
use Illuminate\Http\Request;

class GoogleDriveController extends Controller
{
    public function login()
    {
        $client = new Google_Client();

        $client->setClientId(env('GOOGLE_DRIVE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_DRIVE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_DRIVE_REDIRECT_URI'));

        $client->addScope(Google_Service_Drive::DRIVE_FILE);

        $client->setAccessType('offline');

        $client->setPrompt('consent');

        return redirect($client->createAuthUrl());
    }

    public function callback(Request $request)
    {
        $client = new Google_Client();

        $client->setClientId(env('GOOGLE_DRIVE_CLIENT_ID'));

        $client->setClientSecret(env('GOOGLE_DRIVE_CLIENT_SECRET'));

        $client->setRedirectUri(env('GOOGLE_DRIVE_REDIRECT_URI'));

        $token = $client->fetchAccessTokenWithAuthCode($request->code);

        // dd($token); //ini dpt refresh token yg nntinya masukkn ke .env
    }
}
