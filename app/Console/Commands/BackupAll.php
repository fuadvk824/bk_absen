<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupAll extends Command
{
    protected $signature = 'backup:all';

    protected $description = 'Backup database dan storage';

    public function handle()
    {
        $this->info('=== Backup Database ===');
        $this->call('db:backup');

        $this->info('=== Backup Storage ===');
        $this->call('storage:backup');

        $this->info('Semua backup selesai.');
        return Command::SUCCESS;
    }
}