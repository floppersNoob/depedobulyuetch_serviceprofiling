<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user
        User::firstOrCreate(
            ['email' => 'dpwh_admin@dpwh.local'],
            [
                'name' => 'Administrator',
                'email' => 'dpwh_admin@dpwh.local',
                'password' => Hash::make('dpwh_2026'),
            ]
        );

        $this->command->info('Default admin user created.');
        $this->command->info('Username: dpwh_admin');
        $this->command->info('Password: dpwh_2026');
    }
}
