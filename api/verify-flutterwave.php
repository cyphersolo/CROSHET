<?php

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$transactionId = $input['transaction_id'] ?? '';

if (empty($transactionId)) {
    jsonResponse(['success' => false, 'message' => 'Transaction ID required'], 400);
}

$secretKey = $config['flutterwave']['secret_key'] ?? '';
if (empty($secretKey) || str_contains($secretKey, 'your-secret-key')) {
    jsonResponse(['success' => false, 'message' => 'Flutterwave is not configured. Add keys in api/config.local.php'], 503);
}

$result = curlRequest(
    'https://api.flutterwave.com/v3/transactions/' . urlencode($transactionId) . '/verify',
    'GET',
    null,
    ['Authorization: Bearer ' . $secretKey]
);

if (($result['status'] ?? '') !== 'success') {
    jsonResponse(['success' => false, 'message' => 'Payment verification failed'], 400);
}

$data = $result['data'] ?? [];
$status = $data['status'] ?? '';

if ($status !== 'successful') {
    jsonResponse(['success' => false, 'message' => 'Payment was not successful', 'status' => $status], 400);
}

jsonResponse([
    'success'        => true,
    'transaction_id' => $data['id'] ?? $transactionId,
    'tx_ref'         => $data['tx_ref'] ?? '',
    'amount'         => $data['amount'] ?? 0,
    'currency'       => $data['currency'] ?? 'USD',
    'customer'       => $data['customer'] ?? [],
]);
