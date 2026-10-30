<?php


use App\Models\User;
use Spatie\Permission\Models\Role;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('authenticated admin users can visit the dashboard', function () {
    $role = Role::findOrCreate('admin', 'web');

    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $user->assignRole($role);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
});


// use App\Models\User;

// test('guests are redirected to the login page', function () {
//     $response = $this->get(route('dashboard'));
//     $response->assertRedirect(route('login'));
// });

// test('authenticated users can visit the dashboard', function () {
//     $user = User::factory()->create();
//     $this->actingAs($user);

//     $response = $this->get(route('dashboard'));
//     $response->assertOk();
// });