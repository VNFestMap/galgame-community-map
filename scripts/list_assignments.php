<?php
/**
 * 显示成员分配列表（供核对用）
 */
$membersFile = __DIR__ . '/../data/qq_members.json';
$clubsFile = __DIR__ . '/../data/clubs.json';
$clubsJapanFile = __DIR__ . '/../data/clubs_japan.json';

$lines = file($membersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$members = [];
foreach ($lines as $line) {
    $parts = explode("\t", $line);
    if (count($parts) >= 2) {
        $members[] = [
            'qq' => trim($parts[0]),
            'nickname' => trim($parts[1]),
            'group_nick' => trim($parts[2] ?? ''),
        ];
    }
}

$clubList = [];   // indexed list for iteration (findClub)
foreach (json_decode(file_get_contents($clubsJapanFile), true)['data'] ?? [] as $c) {
    $clubList[] = ['id' => $c['id'], 'school' => $c['school'] ?? '', 'name' => $c['name'] ?? ''];
}
foreach (json_decode(file_get_contents($clubsFile), true)['data'] ?? [] as $c) {
    $clubList[] = ['id' => $c['id'], 'school' => $c['school'] ?? '', 'name' => $c['name'] ?? ''];
}

function findClubById($id, $clubList) {
    $matches = [];
    foreach ($clubList as $c) {
        if ($c['id'] == $id) $matches[] = $c;
    }
    // Prefer China club (loaded second) when IDs overlap
    return !empty($matches) ? end($matches) : null;
}

$manualMap = [
    '2997016663' => ['skip', '群主自己，已有账号'],
    '623372681' => ['bind', 174, 'mem', '好得很 → 复旦(成员)'],
    '2606637281' => ['bind', 17, 'mem', '光醮 → 北交(成员)'],
    '1719210758' => ['multi', [[184, 'rep'],[188, 'mgr']], '封寒修 → 成都理工(会长)+电子科大(管理员)'],
    '3074181377' => ['bind', 227, 'rep', 'YudSu → 鲲岛galgame(会长)'],
    '1290513758' => ['bind', 79, 'rep', '琼华重梦 → 华中科大(会长)'],
    '106663677' => ['bind', 174, 'rep', 'TPZ_2.0 → 复旦(会长)'],
    '279145030' => ['bind', 17, 'rep', 'Dawn → 北交(会长)'],
    '3252414541' => ['bind', 208, 'rep', 'Floral→ 宁波大学(会长)'],
    '2013596581' => ['bind', 210, 'rep', '时月照笛 → 浙师大(会长)'],
    '2032149193' => ['bind', 221, 'rep', 'そばに→ 重庆理工(会长)'],
    '2835169618' => ['bind', 84, 'rep', 'NANAwuli → 南华(会长)'],
    '1115227169' => ['bind', 77, 'rep', 'NARCISSU → 武理工(会长)'],
    '3325763501' => ['bind', 23, 'rep', '伪下鸭 → 厦大(会长)'],
    '3489207841' => ['bind', 33, 'rep', '7eaParty → 深大(会长)'],
    '2757042965' => ['bind', 76, 'rep', 'mina → 地大武汉(会长)'],
    '2761356396' => ['bind', 16, 'rep', '七影蝶 → 北大(会长)'],
    '2503038305' => ['bind', 145, 'rep', '群倾 → 山大(会长)'],
    '2013890398' => ['bind', 50, 'rep', 'Aki → 海南大学(会长)'],
    '2958304041' => ['bind', 6, 'rep', '蹲家大师 → 中科大(会长)'],
    '1817152484' => ['bind', 155, 'rep', 'Nimisora → 西电(会长)'],
    '2251095613' => ['bind', 219, 'rep', '绪方恋香 → 西南政法(会长)'],
    '3618272979' => ['bind', 183, 'rep', '蒼蘭 → 川大(会长)'],
    '2535019955' => ['bind', 23, 'mgr', '一扬漫远 → 厦门大学'],
    '2291247370' => ['bind', 12, 'mgr', '剑之远征 → 京都大学(日本)'],
    '3566196747' => ['bind', 6, 'mgr', '杏 → 中科大'],
    '731276775' => ['bind', 174, 'mgr', 'ミク張 → 复旦'],
    '1826144055' => ['bind', 184, 'mgr', '木台 → 成都理工'],
    '1501718818' => ['bind', 88, 'mgr', '布丁 → 湖南科大'],
];

$abbrToSchool = [
    'YCIT' => '盐城工学院', 'CDUT' => '成都理工大学', 'UESTC' => '电子科技大学',
    'CSUST' => '长沙理工大学', 'BJTU' => '北京交通大学', 'FDU' => '复旦大学',
    'WHU' => '武汉大学', 'NUIST' => '南京信息工程大学', 'CSUFT' => '中南林业科技大学',
    'XTU' => '湘潭大学', 'SWUST' => '西南科技大学', 'ZJNU' => '浙江师范大学',
    'SWUPL' => '西南政法大学', 'HNUST' => '湖南科技大学', 'USC' => '南华大学',
    'HUST' => '华中科技大学', 'XHU' => '西华大学', 'BUCT' => '北京化工大学',
    'AHU' => '安徽大学', 'SDU' => '山东大学', 'LZU' => '兰州大学',
    'DHU' => '东华大学', 'CUFE' => '中央财经大学', 'CQUT' => '重庆理工大学',
    'PKU' => '北京大学', 'JLU' => '吉林大学', 'NKU' => '南开大学',
    'NBU' => '宁波大学', 'SJTU' => '上海交通大学', 'CSU' => '中南大学',
    'ZUEL' => '中南财经政法大学', 'HZAU' => '华中农业大学', 'CUG' => '中国地质大学（武汉）',
    'WUT' => '武汉理工大学', 'WYU' => '五邑大学', 'TGU' => '天津工业大学',
    'WIT' => '武汉工程大学', 'TUT' => '天津理工大学', 'NJFU' => '南京林业大学',
    'SCU' => '四川大学', 'SUES' => '上海工程技术大学', 'CUGB' => '中国地质大学（北京）',
    'SHU' => '上海大学', 'NJU' => '南京大学', 'HBU' => '河北大学',
    'USTC' => '中国科学技术大学', 'IMU' => '内蒙古大学', 'USTB' => '北京科技大学',
    'BJUT' => '北京工业大学', 'ECNU' => '华东师范大学', 'GUET' => '桂林电子科技大学',
    'GXU' => '广西大学', 'ZJSU' => '浙江工商大学', 'CQUPT' => '重庆邮电大学',
    'UJS' => '江苏大学', 'SMU' => '上海海事大学', 'GCC' => '广州商学院',
    'HHU' => '河海大学', 'NCEPU' => '华北电力大学', 'YSU' => '燕山大学',
    'HEBUT' => '河北工业大学', 'SWU' => '西南大学', 'SWJTU' => '西南交通大学',
    'GDOU' => '广东海洋大学', 'ZUST' => '浙江科技大学', 'SZU' => '深圳大学',
    'XMU' => '厦门大学', 'BJFU' => '北京林业大学', 'ZWU' => '浙江万里学院',
    'NWMU' => '西北民族大学', 'CCZU' => '常州大学', 'HNU' => '湖南大学',
    'BNBU' => '北师香港浸会大学', 'JUST' => '江苏科技大学', 'TJU' => '天津大学',
    'UNNC' => '宁波诺丁汉大学', 'NUAA' => '南京航天航空大学', 'GNSD' => '赣南师范大学',
    'HNNU' => '海南师范大学', 'NPU' => '西北工业大学', 'WMU' => '温州医科大学',
    'SKD' => '山东科技大学', 'NJIT' => '南京工程学院', 'SICAU' => '四川农业大学',
    'HAU' => '河南农业大学', 'HZU' => '惠州学院', 'BFSU' => '北京外国语大学',
    'FJPC' => '福建警察学院', 'IMMU' => '内蒙古医科大学', 'AQNU' => '安庆师范大学',
    'NCU' => '南昌大学', 'WUST' => '武汉科技大学', 'STBU' => '上海商学院',
    'HNIST' => '湖南理工学院', 'HYTC' => '衡阳师范学院', 'UCAS' => '中国科学院大学',
    'SZK' => '深圳信息职业技术学院', 'UPC' => '中国石油大学（华东）',
    'CUP' => '中国石油大学（北京）', 'THU' => '清华大学', 'SHUPL' => '上海政法大学',
];

function findClub($schoolName, $clubList) {
    foreach ($clubList as $c) {
        if ($c['school'] === $schoolName) return $c;
    }
    $s = str_replace(['（', '）'], ['(', ')'], $schoolName);
    foreach ($clubList as $c) {
        $cs = str_replace(['（', '）'], ['(', ')'], $c['school']);
        if ($cs === $s) return $c;
    }
    return null;
}

function getAbbrFromNick($nick) {
    global $abbrToSchool;
    $upper = strtoupper($nick);
    $best = '';
    foreach ($abbrToSchool as $abbr => $school) {
        if (strpos($upper, $abbr) !== false) {
            if (strlen($abbr) > strlen($best)) $best = $abbr;
        }
    }
    return $best ? $abbrToSchool[$best] : null;
}

$bindList = [];
$accountOnly = [];
$skipped = [];

foreach ($members as $m) {
    $qq = $m['qq'];
    $nick = $m['group_nick'];

    if (strpos($nick, '消息同步') !== false) { $skipped[] = [$qq, $m['nickname'], $nick, '消息同步bot']; continue; }

    if (isset($manualMap[$qq])) {
        $p = $manualMap[$qq];
        if ($p[0] === 'skip') { $skipped[] = [$qq, $m['nickname'], $nick, $p[1]]; continue; }
        if ($p[0] === 'bind') {
            $club = findClubById($p[1], $clubList);
            $roleMap = ['rep' => '会长', 'mgr' => '管理员', 'mem' => '成员'];
            $role = $roleMap[$p[2]] ?? '管理员';
            $clubKey = ($club['school'] ?? '???') . ' - ' . ($club['name'] ?? '???');
            $bindList[$clubKey][] = [$qq, $m['nickname'], $nick, $role, $p[3] ?? ''];
            continue;
        }
        if ($p[0] === 'multi') {
            foreach ($p[1] as $b) {
                $club = findClubById($b[0], $clubList);
                $role = $b[1] === 'rep' ? '会长' : '管理员';
                $clubKey = ($club['school'] ?? '???') . ' - ' . ($club['name'] ?? '???');
                $bindList[$clubKey][] = [$qq, $m['nickname'], $nick, $role, $p[2] ?? ''];
            }
            continue;
        }
    }

    if (strpos($nick, 'AG-loli') !== false) { $skipped[] = [$qq, $m['nickname'], $nick, 'AG-loli暂不处理']; continue; }

    $schoolName = getAbbrFromNick($nick);
    if ($schoolName) {
        $club = findClub($schoolName, $clubList);
        if ($club) {
            $clubKey = $club['school'] . ' - ' . $club['name'];
            $bindList[$clubKey][] = [$qq, $m['nickname'], $nick, '管理员', '缩写匹配'];
            continue;
        }
    }

    foreach ($clubList as $c) {
        if ($c['school'] !== '' && strpos($nick, $c['school']) !== false) {
            $clubKey = $c['school'] . ' - ' . $c['name'];
            $bindList[$clubKey][] = [$qq, $m['nickname'], $nick, '管理员', '校名匹配'];
            continue 2;
        }
    }

    $keywords = [
        '海带姬松' => '海南大学', '埋土小恐龙' => '成都理工大学', '湖科大' => '湖南科技大学',
        '南七坂' => '中国科学技术大学', '未来之瞳' => '西安电子科技大学', '九日九' => '复旦大学',
        '京美同' => '京都大学',
    ];
    $matched = false;
    foreach ($keywords as $kw => $school) {
        if (strpos($nick, $kw) !== false) {
            $club = findClub($school, $clubList);
            if ($club) {
                $clubKey = $club['school'] . ' - ' . $club['name'];
                $bindList[$clubKey][] = [$qq, $m['nickname'], $nick, '管理员', '关键词:' . $kw];
                $matched = true; break;
            }
        }
    }
    if ($matched) continue;

    if (strpos($nick, '崇元尚武会') !== false || strpos($nick, 'OTA宅月') !== false) {
        $skipped[] = [$qq, $m['nickname'], $nick, '崇元尚武会/OTA宅月暂不处理']; continue;
    }

    $accountOnly[] = [$qq, $m['nickname'], $nick];
}

ksort($bindList);

echo "==================== 已匹配到同好会 ====================\n\n";
foreach ($bindList as $clubKey => $items) {
    printf("【%s】\n", $clubKey);
    foreach ($items as $item) {
        printf("  %s | %s | %s", str_pad($item[3], 9), $item[0], $item[1]);
        if ($item[2]) printf(" | %s", $item[2]);
        printf("\n");
    }
    echo "\n";
}

echo "==================== 仅建账号(无归属) ====================\n\n";
foreach ($accountOnly as $item) {
    printf("%s | %s", $item[0], $item[1]);
    if ($item[2]) printf(" | %s", $item[2]);
    printf("\n");
}
printf("\n共 %d 人\n\n", count($accountOnly));

echo "==================== 跳过 ====================\n\n";
foreach ($skipped as $item) {
    printf("%s | %s | %s\n", $item[0], $item[1], $item[3]);
}
printf("\n共 %d 人\n", count($skipped));
