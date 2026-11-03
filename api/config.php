<?php

$configFile = __DIR__ . '/config.local.php';
if (!file_exists($configFile)) {
    $configFile = __DIR__ . '/config.example.php';
}

$config = require $configFile;

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data);
    exit;
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function generateTxRef(): string
{
    return 'MIR-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
}

function validateCart(array $items): array
{
    $validated = [];
    foreach ($items as $item) {
        if (empty($item['name']) || !isset($item['price']) || !isset($item['quantity'])) {
            continue;
        }
        $qty = max(1, (int) $item['quantity']);
        $price = round((float) $item['price'], 2);
        if ($price <= 0) {
            continue;
        }
        $validated[] = [
            'name'     => substr(strip_tags($item['name']), 0, 120),
            'price'    => $price,
            'quantity' => $qty,
        ];
    }
    return $validated;
}

function cartTotal(array $items): float
{
    $total = 0;
    foreach ($items as $item) {
        $total += $item['price'] * $item['quantity'];
    }
    return round($total, 2);
}

function curlRequest(string $url, string $method = 'GET', ?array $body = null, array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        $headers[] = 'Content-Type: application/json';
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['error' => $error];
    }

    return json_decode($response, true) ?: ['error' => 'Invalid response'];
}
