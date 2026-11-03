<?php

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$secretKey = $config['stripe']['secret_key'] ?? '';
$sessionId = getJsonInput()['session_id'] ?? '';

if (empty($sessionId)) {
    jsonResponse(['success' => false, 'message' => 'Session ID required'], 400);
}

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions/' . urlencode($sessionId));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $secretKey]);
$response = curl_exec($ch);
curl_close($ch);

$session = json_decode($response, true);

if (($session['payment_status'] ?? '') !== 'paid') {
    jsonResponse(['success' => false, 'message' => 'Payment not completed'], 400);
}

jsonResponse([
    'success'    => true,
    'session_id' => $sessionId,
    'amount'     => ($session['amount_total'] ?? 0) / 100,
    'currency'   => strtoupper($session['currency'] ?? 'USD'),
]);
