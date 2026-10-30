<?php
test('new users cannot register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('email');

    $this->assertGuest();

    $this->assertDatabaseMissing('users', [
        'email' => 'test@example.com',
    ]);
});
// test('registration screen can be rendered', function () {
//     $response = $this->get(route('register'));

//     $response->assertOk();
// });

// test('new users can register', function () {
//     $response = $this->post(route('register.store'), [
//         'name' => 'Test User',
//         'email' => 'test@example.com',
//         'password' => 'password',
//         'password_confirmation' => 'password',
//     ]);

//     $this->assertAuthenticated();
//     $response->assertRedirect(route('dashboard', absolute: false));
// });