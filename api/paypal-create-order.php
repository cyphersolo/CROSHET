<?php

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$clientId = $config['paypal']['client_id'] ?? '';
$secret   = $config['paypal']['secret'] ?? '';

if (empty($clientId) || str_contains($clientId, 'your-paypal')) {
    jsonResponse(['success' => false, 'message' => 'PayPal is not configured. Add keys in api/config.local.php'], 503);
}

$input = getJsonInput();
$items = validateCart($input['items'] ?? []);
$total = cartTotal($items);

if ($total <= 0) {
    jsonResponse(['success' => false, 'message' => 'Cart is empty'], 400);
}

$mode = ($config['paypal']['mode'] ?? 'sandbox') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

$ch = curl_init($mode . '/v1/oauth2/token');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
    CURLOPT_HTTPHEADER     => [
        'Authorization: Basic ' . base64_encode($clientId . ':' . $secret),
        'Content-Type: application/x-www-form-urlencoded',
    ],
]);
$auth = json_decode(curl_exec($ch), true);
curl_close($ch);

if (empty($auth['access_token'])) {
    jsonResponse(['success' => false, 'message' => 'PayPal authentication failed'], 502);
}

$currency = $config['currency'] ?? 'USD';
$order = curlRequest(
    $mode . '/v2/checkout/orders',
    'POST',
    [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'amount' => [
                'currency_code' => $currency,
                'value'         => number_format($total, 2, '.', ''),
            ],
            'description' => 'Made in Rwanda Crochet order',
        ]],
    ],
    ['Authorization: Bearer ' . $auth['access_token']]
);

if (empty($order['id'])) {
    jsonResponse(['success' => false, 'message' => 'Failed to create PayPal order'], 502);
}

jsonResponse(['success' => true, 'order_id' => $order['id']]);
