<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GoogleDriveService;

class BackupDatabase extends Command
{
    protected $signature = 'db:backup';

    protected $description = 'Backup database dan upload ke Google Drive';

    public function handle()
    {
        $backupDir = storage_path('app/backup');

        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0777, true);
        }

        $filename = 'backup_' . now()->format('Ymd_His') . '.sql';
        $path = $backupDir . DIRECTORY_SEPARATOR . $filename;

        $command = sprintf(
            'mysqldump -h%s -u%s -p"%s" %s > "%s"',
            env('DB_HOST'),
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            env('DB_DATABASE'),
            $path
        );

        exec($command, $output, $resultCode);

        if ($resultCode !== 0 || !file_exists($path)) {
            $this->error('Backup database gagal.');
            return Command::FAILURE;
        }

        try {

            $drive = new GoogleDriveService();

            $drive->upload($path, $filename);

            unlink($path);

            $this->info('Backup berhasil diupload ke Google Drive.');

            return Command::SUCCESS;

        } catch (\Exception $e) {

            $this->error($e->getMessage());

            return Command::FAILURE;
        }
    }
}