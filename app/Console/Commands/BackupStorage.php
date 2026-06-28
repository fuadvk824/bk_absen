<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GoogleDriveService;
use ZipArchive;
use RecursiveIteratorIterator;
use RecursiveDirectoryIterator;

class BackupStorage extends Command
{
    protected $signature = 'storage:backup';
    protected $description = 'Backup folder storage/app/public ke Google Drive';

    public function handle()
    {
        $backupDir = storage_path('app/backup');

        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0777, true);
        }

        $filename = 'storage_' . now()->format('Ymd_His') . '.zip';
        $zipPath = $backupDir . DIRECTORY_SEPARATOR . $filename;
        $source = storage_path('app/public');
        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->error('Gagal membuat file ZIP.');

            return Command::FAILURE;
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($source)
        );

        foreach ($files as $file) {

            if ($file->isDir()) {
                continue;
            }

            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($source) + 1);
            $zip->addFile($filePath, $relativePath);
        }

        $zip->close();

        try {

            $drive = new GoogleDriveService();
            $drive->upload($zipPath, $filename, 2, 'storage_');

            unlink($zipPath);

            $this->info('Backup storage berhasil diupload.');

            return Command::SUCCESS;
        } catch (\Exception $e) {

            $this->error($e->getMessage());

            return Command::FAILURE;
        }
    }
}
