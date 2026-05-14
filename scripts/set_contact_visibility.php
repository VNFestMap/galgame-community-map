<?php
// scripts/set_contact_visibility.php
// Usage:
//   php scripts/set_contact_visibility.php public
//   php scripts/set_contact_visibility.php members
//   php scripts/set_contact_visibility.php protected

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script can only be run from CLI.\n");
    exit(1);
}

$mode = $argv[1] ?? '';
$modes = [
    'public' => [
        'visible_by_default' => true,
        'protected' => false,
        'label' => '公开联系方式',
    ],
    'members' => [
        'visible_by_default' => false,
        'protected' => false,
        'label' => '默认成员以上可见',
    ],
    'protected' => [
        'visible_by_default' => false,
        'protected' => true,
        'label' => '仅绑定本校可见',
    ],
];

if (!isset($modes[$mode])) {
    fwrite(STDERR, "Usage: php scripts/set_contact_visibility.php <public|members|protected>\n");
    fwrite(STDERR, "  public    = 公开联系方式\n");
    fwrite(STDERR, "  members   = 默认成员以上可见\n");
    fwrite(STDERR, "  protected = 仅绑定本校可见\n");
    exit(1);
}

$root = dirname(__DIR__);
$files = [
    $root . '/data/clubs.json',
    $root . '/data/clubs_japan.json',
];
$timestamp = date('Ymd-His');
$settings = $modes[$mode];
$totalChanged = 0;

foreach ($files as $file) {
    if (!is_file($file)) {
        fwrite(STDERR, "Missing file: {$file}\n");
        exit(1);
    }

    $raw = file_get_contents($file);
    $json = json_decode($raw, true);
    if (!is_array($json) || !isset($json['data']) || !is_array($json['data'])) {
        fwrite(STDERR, "Invalid JSON shape: {$file}\n");
        exit(1);
    }

    $backup = $file . '.bak-' . $timestamp;
    if (!copy($file, $backup)) {
        fwrite(STDERR, "Failed to create backup: {$backup}\n");
        exit(1);
    }

    $changed = 0;
    foreach ($json['data'] as &$club) {
        if (!is_array($club)) continue;
        $beforeVisible = $club['visible_by_default'] ?? null;
        $beforeProtected = $club['protected'] ?? null;

        $club['visible_by_default'] = $settings['visible_by_default'];
        $club['protected'] = $settings['protected'];

        if ($beforeVisible !== $club['visible_by_default'] || $beforeProtected !== $club['protected']) {
            $changed++;
        }
    }
    unset($club);

    $encoded = json_encode($json, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($encoded === false) {
        fwrite(STDERR, "Failed to encode JSON: {$file}\n");
        exit(1);
    }

    if (file_put_contents($file, $encoded, LOCK_EX) === false) {
        fwrite(STDERR, "Failed to write file: {$file}\n");
        exit(1);
    }

    $totalChanged += $changed;
    echo basename($file) . ": updated {$changed} clubs, backup " . basename($backup) . "\n";
}

echo "Done. Mode: {$mode} ({$settings['label']}), total updated: {$totalChanged}\n";
