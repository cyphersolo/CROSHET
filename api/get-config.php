<?php

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

$providers = [];

if (!empty($config['flutterwave']['enabled'])
    && !empty($config['flutterwave']['public_key'])
    && !str_contains($config['flutterwave']['public_key'], 'your-public-key')) {
    $providers['flutterwave'] = [
        'public_key' => $config['flutterwave']['public_key'],
    ];
}

if (!empty($config['paypal']['enabled'])
    && !empty($config['paypal']['client_id'])
    && !str_contains($config['paypal']['client_id'], 'your-paypal')) {
    $providers['paypal'] = [
        'client_id' => $config['paypal']['client_id'],
        'mode'      => $config['paypal']['mode'] ?? 'sandbox',
    ];
}

if (!empty($config['stripe']['enabled'])
    && !empty($config['stripe']['public_key'])
    && !str_contains($config['stripe']['public_key'], 'your-public-key')) {
    $providers['stripe'] = [
        'public_key' => $config['stripe']['public_key'],
    ];
}

jsonResponse([
    'currency' => $config['currency'] ?? 'USD',
    'business' => [
        'name'  => $config['business']['name'] ?? 'Made in Rwanda Crochet',
        'phone' => $config['business']['phone'] ?? '+250786698491',
    ],
    'providers' => $providers,
]);
