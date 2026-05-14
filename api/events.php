<?php
// api_events.php - 活动数据管理 API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/events.json';

function appendEventToFile(string $dataFile, array $input): array {
    $handle = fopen($dataFile, 'c+');
    if (!$handle) {
        return ['success' => false, 'message' => '无法打开活动数据文件'];
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return ['success' => false, 'message' => '无法锁定活动数据文件'];
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        $current = $content ? json_decode($content, true) : ['events' => []];
        if (!is_array($current)) {
            $current = ['events' => []];
        }
        $events = is_array($current['events'] ?? null) ? $current['events'] : [];

        $eventName = trim((string)($input['event'] ?? ''));
        $eventDate = trim((string)($input['date'] ?? ''));
        foreach ($events as $event) {
            if (trim((string)($event['event'] ?? '')) === $eventName && trim((string)($event['date'] ?? '')) === $eventDate) {
                return ['success' => false, 'message' => '同名同日期活动已存在，未重复添加', 'code' => 'duplicate_event'];
            }
        }

        $maxId = 0;
        foreach ($events as $event) {
            $id = (int)($event['id'] ?? 0);
            if ($id > $maxId) $maxId = $id;
        }

        $newEvent = [
            'id' => $maxId + 1,
            'event' => $eventName,
            'date' => $eventDate,
            'date_end' => $input['date_end'] ?? null,
            'image' => $input['image'] ?? '',
            'raw_text' => $input['raw_text'] ?? '',
            'offical' => $input['offical'] ?? 0,
            'description' => $input['description'] ?? '',
            'link' => $input['link'] ?? '',
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $events[] = $newEvent;
        $json = json_encode(['events' => $events], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        if ($json === false) {
            return ['success' => false, 'message' => '活动数据编码失败'];
        }

        rewind($handle);
        ftruncate($handle, 0);
        $written = fwrite($handle, $json);
        fflush($handle);

        if ($written === false) {
            return ['success' => false, 'message' => '保存失败，请检查文件权限'];
        }

        return ['success' => true, 'message' => '活动已添加', 'event' => $newEvent];
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

// GET - 读取数据
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // action=registrations: 获取报名数据（公开）
    if (isset($_GET['action']) && $_GET['action'] === 'registrations') {
        $regFile = __DIR__ . '/../data/event_registrations.json';
        $registrations = [];
        if (file_exists($regFile)) {
            $content = file_get_contents($regFile);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) $registrations = $decoded;
        }

        $eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
        if ($eventId > 0) {
            $registrations = array_values(array_filter($registrations, function($r) use ($eventId) {
                return $r['event_id'] === $eventId;
            }));
        }

        echo json_encode(['success' => true, 'registrations' => $registrations]);
        exit();
    }

    if (file_exists($dataFile)) {
        $content = file_get_contents($dataFile);
        // 验证 JSON 格式
        if (json_decode($content) === null) {
            // JSON 格式错误，返回空数组
            echo json_encode(['events' => []]);
        } else {
            echo $content;
        }
    } else {
        echo json_encode(['events' => []]);
    }
    exit();
}

// POST - 保存数据（需要验证）
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/../includes/auth.php';

    // action=add: 管理员/负责人追加单条活动，避免整包覆盖已有活动
    if (isset($_GET['action']) && $_GET['action'] === 'add') {
        requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['event']) || !isset($input['date'])) {
            echo json_encode(['success' => false, 'message' => '缺少必填字段']);
            exit();
        }

        echo json_encode(appendEventToFile($dataFile, $input), JSON_UNESCAPED_UNICODE);
        exit();
    }

    // action=register: 登录用户报名活动
    if (isset($_GET['action']) && $_GET['action'] === 'register') {
        requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['event_id'])) {
            echo json_encode(['success' => false, 'message' => '缺少活动 ID']);
            exit();
        }

        $user = getCurrentUser();
        $eventId = (int)$input['event_id'];
        $regFile = __DIR__ . '/../data/event_registrations.json';

        $registrations = [];
        if (file_exists($regFile)) {
            $content = file_get_contents($regFile);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) $registrations = $decoded;
        }

        // 检查是否已报名
        foreach ($registrations as $r) {
            if ($r['event_id'] === $eventId && $r['user_id'] === (int)$user['id']) {
                echo json_encode(['success' => false, 'message' => '您已报名该活动']);
                exit();
            }
        }

        $registrations[] = [
            'event_id' => $eventId,
            'user_id' => (int)$user['id'],
            'username' => $user['nickname'] ?? $user['username'],
            'registered_at' => date('Y-m-d H:i:s'),
        ];

        file_put_contents($regFile, json_encode($registrations, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => '报名成功']);
        exit();
    }

    // action=unregister: 取消报名
    if (isset($_GET['action']) && $_GET['action'] === 'unregister') {
        requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['event_id'])) {
            echo json_encode(['success' => false, 'message' => '缺少活动 ID']);
            exit();
        }

        $user = getCurrentUser();
        $eventId = (int)$input['event_id'];
        $regFile = __DIR__ . '/../data/event_registrations.json';

        $registrations = [];
        if (file_exists($regFile)) {
            $content = file_get_contents($regFile);
            $decoded = json_decode($content, true);
            if (is_array($decoded)) $registrations = $decoded;
        }

        $found = false;
        $newRegs = [];
        foreach ($registrations as $r) {
            if ($r['event_id'] === $eventId && $r['user_id'] === (int)$user['id']) {
                $found = true;
                continue;
            }
            $newRegs[] = $r;
        }

        if (!$found) {
            echo json_encode(['success' => false, 'message' => '您未报名该活动']);
            exit();
        }

        file_put_contents($regFile, json_encode($newRegs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => '已取消报名']);
        exit();
    }

    requireAdmin();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['events'])) {
        echo json_encode(['success' => false, 'message' => '无效的数据']);
        exit();
    }

    $incomingEvents = is_array($input['events']) ? $input['events'] : [];
    if (isset($_GET['action']) && $_GET['action'] === 'replace') {
        $result = ['events' => $incomingEvents];
    } else {
        $current = ['events' => []];
        if (file_exists($dataFile)) {
            $decoded = json_decode(file_get_contents($dataFile), true);
            if (is_array($decoded)) $current = $decoded;
        }
        $existingEvents = is_array($current['events'] ?? null) ? $current['events'] : [];
        $merged = [];
        $seen = [];
        $maxId = 0;

        foreach ($existingEvents as $event) {
            $id = (int)($event['id'] ?? 0);
            if ($id > $maxId) $maxId = $id;
            $key = $id > 0 ? 'id:' . $id : 'name:' . trim((string)($event['event'] ?? '')) . '|date:' . trim((string)($event['date'] ?? ''));
            $duplicateKey = 'name:' . trim((string)($event['event'] ?? '')) . '|date:' . trim((string)($event['date'] ?? ''));
            $seen[$key] = count($merged);
            $seen[$duplicateKey] = count($merged);
            $merged[] = $event;
        }

        foreach ($incomingEvents as $event) {
            if (!is_array($event)) continue;
            $id = (int)($event['id'] ?? 0);
            if ($id <= 0) {
                $id = ++$maxId;
                $event['id'] = $id;
            } elseif ($id > $maxId) {
                $maxId = $id;
            }
            $key = 'id:' . $id;
            $duplicateKey = 'name:' . trim((string)($event['event'] ?? '')) . '|date:' . trim((string)($event['date'] ?? ''));
            if (isset($seen[$key])) {
                $merged[$seen[$key]] = array_merge($merged[$seen[$key]], $event);
            } elseif (isset($seen[$duplicateKey])) {
                $merged[$seen[$duplicateKey]] = array_merge($merged[$seen[$duplicateKey]], $event);
            } else {
                $seen[$key] = count($merged);
                $seen[$duplicateKey] = count($merged);
                $merged[] = $event;
            }
        }

        $result = ['events' => $merged];
    }

    $success = file_put_contents($dataFile, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    if ($success !== false) {
        echo json_encode(['success' => true, 'message' => '保存成功']);
    } else {
        echo json_encode(['success' => false, 'message' => '保存失败，请检查文件权限']);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => '不支持的请求方法']);
?>
