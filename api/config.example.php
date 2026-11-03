<?php
/**
 * Payment configuration — copy to config.local.php and add your API keys.
 * Get Flutterwave keys: https://dashboard.flutterwave.com/settings/apis
 * Get PayPal keys: https://developer.paypal.com/dashboard/
 * Get Stripe keys: https://dashboard.stripe.com/apikeys
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
        'enabled'   => true,
        'client_id' => 'your-paypal-client-id',
        'secret'    => 'your-paypal-secret',
        'mode'      => 'sandbox',
    ],

    'stripe' => [
        'enabled'    => true,
        'public_key' => 'pk_test_your-public-key',
        'secret_key' => 'sk_test_your-secret-key',
    ],
];
