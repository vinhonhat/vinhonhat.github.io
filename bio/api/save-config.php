<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function reply(int $status, bool $ok, string $message): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, false, 'Chỉ chấp nhận phương thức POST.');
}

$requestedWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
if ($requestedWith !== 'BioLinkAdmin') {
    reply(400, false, 'Yêu cầu không hợp lệ.');
}

// Chỉ cho phép gọi cùng host khi trình duyệt gửi Origin.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && $host !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $hostOnly = preg_replace('/:\d+$/', '', $host);
    if (!is_string($originHost) || strcasecmp($originHost, (string)$hostOnly) !== 0) {
        reply(403, false, 'Không cho phép lưu từ tên miền khác.');
    }
}

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '' || strlen($raw) > 8 * 1024 * 1024) {
    reply(400, false, 'Dữ liệu trống hoặc quá lớn.');
}

$payload = json_decode($raw, true);
if (!is_array($payload)) {
    reply(400, false, 'Dữ liệu JSON không hợp lệ.');
}

$password = $payload['password'] ?? '';
$config = $payload['config'] ?? null;
if (!is_string($password) || !is_array($config)) {
    reply(400, false, 'Thiếu mật khẩu hoặc cấu hình.');
}

$passwordFile = __DIR__ . '/.admin-password';
$storedHash = is_file($passwordFile) ? trim((string)file_get_contents($passwordFile)) : '';
if (!preg_match('/^[a-f0-9]{64}$/i', $storedHash)) {
    reply(500, false, 'File mật khẩu máy chủ chưa hợp lệ.');
}
if (!hash_equals(strtolower($storedHash), hash('sha256', $password))) {
    reply(403, false, 'Mật khẩu máy chủ không đúng.');
}

if (!isset($config['profile'], $config['admin'], $config['settings'], $config['links'], $config['socialIcons'])
    || !is_array($config['links']) || !is_array($config['socialIcons'])) {
    reply(422, false, 'Cấu trúc cấu hình không hợp lệ.');
}

$configJson = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($configJson === false) {
    reply(422, false, 'Không thể mã hóa cấu hình.');
}
$content = "/* Cấu hình Bio Link - lưu trực tiếp từ bảng cài đặt */\nwindow.BIO_CONFIG = " . $configJson . ";\n";

$configPath = dirname(__DIR__) . '/js/config.js';
$configDir = dirname($configPath);
if (!is_dir($configDir) || !is_writable($configDir) || (is_file($configPath) && !is_writable($configPath))) {
    reply(500, false, 'Máy chủ chưa cấp quyền ghi cho js/config.js.');
}

$tempPath = $configPath . '.tmp-' . bin2hex(random_bytes(5));
if (file_put_contents($tempPath, $content, LOCK_EX) === false) {
    reply(500, false, 'Không thể tạo file cấu hình tạm.');
}
if (!rename($tempPath, $configPath)) {
    @unlink($tempPath);
    reply(500, false, 'Không thể thay thế file cấu hình trên máy chủ.');
}
@chmod($configPath, 0644);

// Nếu người dùng đổi mật khẩu trong bảng cài đặt, cập nhật hash máy chủ cùng lúc.
$newHash = $config['admin']['passwordHash'] ?? '';
if (is_string($newHash) && preg_match('/^[a-f0-9]{64}$/i', $newHash) && !hash_equals(strtolower($storedHash), strtolower($newHash))) {
    if (file_put_contents($passwordFile, strtolower($newHash) . "\n", LOCK_EX) === false) {
        reply(500, false, 'Đã lưu cấu hình nhưng chưa cập nhật được mật khẩu máy chủ.');
    }
    @chmod($passwordFile, 0600);
}

reply(200, true, 'Đã lưu cấu hình lên máy chủ.');
