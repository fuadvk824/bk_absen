<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Http\MediaFileUpload;

class GoogleDriveService
{
    protected Client $client;
    protected Drive $drive;

    public function __construct()
    {
        $client = new Client();

        $client->setClientId(env('GOOGLE_DRIVE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_DRIVE_CLIENT_SECRET'));

        $client->refreshToken(env('GOOGLE_DRIVE_REFRESH_TOKEN'));

        $this->drive = new Drive($client);
    }
    // public function __construct()
    // {
    //     $this->client = new Client();

    //     $this->client->setClientId(env('GOOGLE_DRIVE_CLIENT_ID'));
    //     $this->client->setClientSecret(env('GOOGLE_DRIVE_CLIENT_SECRET'));

    //     $this->client->refreshToken(env('GOOGLE_DRIVE_REFRESH_TOKEN'));

    //     $this->drive = new Drive($this->client);
    // }

    public function upload($localFile, $filename, $keep, $prefix)
    {
        $file = new DriveFile();

        $file->setName($filename);

        $file->setParents([
            env('GOOGLE_DRIVE_FOLDER_ID')
        ]);

        $content = file_get_contents($localFile);

        $result = $this->drive->files->create(
            $file,
            [
                'data' => $content,
                'mimeType' => 'application/octet-stream',
                'uploadType' => 'multipart'
            ]
        );

        $this->deleteOldBackups($prefix, $keep);

        return $result;
    }
    // public function upload($localFile, $filename, $keep, $prefix)
    // {
    //     $file = new DriveFile();

    //     $file->setName($filename);

    //     $file->setParents([
    //         env('GOOGLE_DRIVE_FOLDER_ID')
    //     ]);

    //     $fileSize = filesize($localFile);

    //     $this->client->setDefer(true);

    //     $request = $this->drive->files->create(
    //         $file,
    //         [
    //             'uploadType' => 'resumable'
    //         ]
    //     );

    //     $chunkSize = 5 * 1024 * 1024; // 5 MB

    //     $media = new MediaFileUpload(
    //         $this->client,
    //         $request,
    //         'application/octet-stream',
    //         null,
    //         true,
    //         $chunkSize
    //     );

    //     $media->setFileSize($fileSize);

    //     $handle = fopen($localFile, 'rb');

    //     while (!$media->isDone() && !feof($handle)) {

    //         $chunk = fread($handle, $chunkSize);

    //         $media->nextChunk($chunk);
    //     }

    //     fclose($handle);

    //     $this->client->setDefer(false);

    //     $this->deleteOldBackups($prefix, $keep);
    // }

    public function deleteOldBackups($prefix, $keep)
    {
        $folderId = env('GOOGLE_DRIVE_FOLDER_ID');

        $files = $this->drive->files->listFiles([
            'q' => "'{$folderId}' in parents and trashed = false and name contains '{$prefix}'",
            'fields' => 'files(id,name,createdTime)',
            'orderBy' => 'createdTime desc'
        ]);

        $files = $files->getFiles();

        if (count($files) <= $keep) {
            return;
        }

        foreach (array_slice($files, $keep) as $file) {
            $this->drive->files->delete($file->getId());
        }
    }
}
