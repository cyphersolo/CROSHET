<?php

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$secretKey = $config['stripe']['secret_key'] ?? '';
if (empty($secretKey) || str_contains($secretKey, 'your-secret-key')) {
    jsonResponse(['success' => false, 'message' => 'Stripe is not configured. Add keys in api/config.local.php'], 503);
}

$input = getJsonInput();
$items = validateCart($input['items'] ?? []);
$total = cartTotal($items);

if ($total <= 0) {
    jsonResponse(['success' => false, 'message' => 'Cart is empty'], 400);
}

$currency = strtolower($config['currency'] ?? 'usd');
$baseUrl = rtrim($input['base_url'] ?? '', '/');
if (empty($baseUrl)) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $baseUrl = $protocol . '://' . $host . '/CROCHET';
}

$lineItems = [];
foreach ($items as $item) {
    $lineItems[] = [
        'price_data' => [
            'currency'     => $currency,
            'product_data' => ['name' => $item['name']],
            'unit_amount'  => (int) round($item['price'] * 100),
        ],
        'quantity' => $item['quantity'],
    ];
}

$postFields = http_build_query([
    'mode'                 => 'payment',
    'success_url'          => $baseUrl . '/payment-success.html?provider=stripe&session_id={CHECKOUT_SESSION_ID}',
    'cancel_url'           => $baseUrl . '/payment-cancelled.html',
    'customer_email'       => $input['email'] ?? '',
    'metadata[tx_ref]'     => generateTxRef(),
]);

foreach ($lineItems as $i => $item) {
    $postFields .= '&line_items[' . $i . '][price_data][currency]=' . urlencode($item['price_data']['currency']);
    $postFields .= '&line_items[' . $i . '][price_data][product_data][name]=' . urlencode($item['price_data']['product_data']['name']);
    $postFields .= '&line_items[' . $i . '][price_data][unit_amount]=' . $item['price_data']['unit_amount'];
    $postFields .= '&line_items[' . $i . '][quantity]=' . $item['quantity'];
}

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $secretKey,
    'Content-Type: application/x-www-form-urlencoded',
]);
$response = curl_exec($ch);
curl_close($ch);

$session = json_decode($response, true);

if (empty($session['url'])) {
    $message = $session['error']['message'] ?? 'Failed to create Stripe session';
    jsonResponse(['success' => false, 'message' => $message], 502);
}

jsonResponse([
    'success'    => true,
    'session_id' => $session['id'],
    'url'        => $session['url'],
]);
