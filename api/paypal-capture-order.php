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
$orderId  = getJsonInput()['order_id'] ?? '';

if (empty($orderId)) {
    jsonResponse(['success' => false, 'message' => 'Order ID required'], 400);
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

$capture = curlRequest(
    $mode . '/v2/checkout/orders/' . urlencode($orderId) . '/capture',
    'POST',
    [],
    ['Authorization: Bearer ' . $auth['access_token']]
);

$status = $capture['status'] ?? '';
if ($status !== 'COMPLETED') {
    jsonResponse(['success' => false, 'message' => 'Payment not completed', 'status' => $status], 400);
}

jsonResponse([
    'success'  => true,
    'order_id' => $orderId,
    'status'   => $status,
]);
