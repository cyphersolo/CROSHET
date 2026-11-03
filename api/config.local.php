<?php
/**
 * Local payment configuration — add your real API keys here.
 * This file is not committed to version control.
 */

return [
    'business' => [
        'name'  => 'Made in Rwanda Crochet',
        'email' => 'hello@madeinrwandacrochet.com',
        'phone' => '+250786698491',
    ],

    'currency' => 'USD',

    'flutterwave' => [
        'enabled'    => true,
        'public_key' => 'FLWPUBK_TEST-your-public-key',
        'secret_key' => 'FLWSECK_TEST-your-secret-key',
    ],

    'paypal' => [
        'enabled'   => false,
        'client_id' => 'your-paypal-client-id',
        'secret'    => 'your-paypal-secret',
        'mode'      => 'sandbox',
    ],

    'stripe' => [
        'enabled'    => false,
        'public_key' => 'pk_test_your-public-key',
        'secret_key' => 'sk_test_your-secret-key',
    ],
];
