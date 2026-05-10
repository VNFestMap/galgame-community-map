<?php
/**
 * 生成完整注册SQL（用户名=QQ号，密码=VNFest）
 * 用法: php scripts/gen_sql.php > output.sql
 */

require_once __DIR__ . '/../config.php';  // 仅用于引入常量

$membersFile = __DIR__ . '/../data/qq_members.json';
$clubsFile = __DIR__ . '/../data/clubs.json';
$clubsJapanFile = __DIR__ . '/../data/clubs_japan.json';

// ===== 读取QQ成员 =====
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

// ===== 读取同好会数据 =====
$allClubs = [];
foreach (json_decode(file_get_contents($clubsFile), true)['data'] ?? [] as $c) {
    $allClubs[] = [
        'id' => $c['id'],
        'country' => 'china',
        'school' => $c['school'] ?? '',
        'name' => $c['name'] ?? '',
    ];
}
foreach (json_decode(file_get_contents($clubsJapanFile), true)['data'] ?? [] as $c) {
    $allClubs[] = [
        'id' => $c['id'],
        'country' => 'japan',
        'school' => $c['school'] ?? '',
        'name' => $c['name'] ?? '',
    ];
}

// 精确查找俱乐部（不走模糊匹配）
function findClub($schoolName, $allClubs) {
    foreach ($allClubs as $c) {
        if ($c['school'] === $schoolName) return $c;
    }
    // 尝试全角半角兼容
    $s = str_replace(['（', '）'], ['(', ')'], $schoolName);
    foreach ($allClubs as $c) {
        $cs = str_replace(['（', '）'], ['(', ')'], $c['school']);
        if ($cs === $s) return $c;
    }
    return null;
}

function findClubById($id, $allClubs) {
    foreach ($allClubs as $c) {
        if ($c['id'] === $id) return $c;
    }
    return null;
}

// ===== 手动定义每个QQ号的归属 =====
// 格式: qq => [club_id, role]   // role: rep=会长, mgr=管理员, mem=普通成员
// null club_id = 只创建账号不绑定

$assignments = [];

// ===== 缩写→学校/俱乐部ID映射（用于批量匹配）=====
$abbrToSchool = [
    'YCIT' => '盐城工学院',
    'CDUT' => '成都理工大学',
    'UESTC' => '电子科技大学',
    'CSUST' => '长沙理工大学',
    'BJTU' => '北京交通大学',
    'FDU' => '复旦大学',
    'WHU' => '武汉大学',
    'NUIST' => '南京信息工程大学',
    'CSUFT' => '中南林业科技大学',
    'XTU' => '湘潭大学',
    'SWUST' => '西南科技大学',
    'ZJNU' => '浙江师范大学',
    'SWUPL' => '西南政法大学',
    'HNUST' => '湖南科技大学',
    'USC' => '南华大学',
    'HUST' => '华中科技大学',
    'XHU' => '西华大学',
    'BUCT' => '北京化工大学',
    'AHU' => '安徽大学',
    'SDU' => '山东大学',
    'LZU' => '兰州大学',
    'DHU' => '东华大学',
    'CUFE' => '中央财经大学',
    'CQUT' => '重庆理工大学',
    'PKU' => '北京大学',
    'JLU' => '吉林大学',
    'NKU' => '南开大学',
    'NBU' => '宁波大学',
    'SJTU' => '上海交通大学',
    'CSU' => '中南大学',
    'ZUEL' => '中南财经政法大学',
    'HZAU' => '华中农业大学',
    'CUG' => '中国地质大学（武汉）',
    'WUT' => '武汉理工大学',
    'WYU' => '五邑大学',
    'TGU' => '天津工业大学',
    'WIT' => '武汉工程大学',
    'TUT' => '天津理工大学',
    'NJFU' => '南京林业大学',
    'SCU' => '四川大学',
    'SUES' => '上海工程技术大学',
    'CUGB' => '中国地质大学（北京）',
    'SHU' => '上海大学',
    'NJU' => '南京大学',
    'HBU' => '河北大学',
    'USTC' => '中国科学技术大学',
    'IMU' => '内蒙古大学',
    'USTB' => '北京科技大学',
    'BJUT' => '北京工业大学',
    'ECNU' => '华东师范大学',
    'GUET' => '桂林电子科技大学',
    'GXU' => '广西大学',
    'ZJSU' => '浙江工商大学',
    'CQUPT' => '重庆邮电大学',
    'UJS' => '江苏大学',
    'SMU' => '上海海事大学',
    'GCC' => '广州商学院',
    'HHU' => '河海大学',
    'NCEPU' => '华北电力大学',
    'YSU' => '燕山大学',
    'HEBUT' => '河北工业大学',
    'SWU' => '西南大学',
    'SWJTU' => '西南交通大学',
    'GDOU' => '广东海洋大学',
    'ZUST' => '浙江科技大学',
    'SZU' => '深圳大学',
    'XMU' => '厦门大学',
    'BJFU' => '北京林业大学',
    'ZWU' => '浙江万里学院',
    'NWMU' => '西北民族大学',
    'CCZU' => '常州大学',
    'HNU' => '湖南大学',
    'BNBU' => '北师香港浸会大学',
    'BNBU' => '北师香港浸会大学',
    'JUST' => '江苏科技大学',
    'TJU' => '天津大学',
    'UNNC' => '宁波诺丁汉大学',
    'NUAA' => '南京航天航空大学',
    'GNSD' => '赣南师范大学',
    'HNNU' => '湖南师范大学',
    'NPU' => '西北工业大学',
    'WMU' => '温州医科大学',
    'SKD' => '上海科技大学',
    'NJIT' => '南京工程学院',
    'SICAU' => '四川农业大学',
    'HAU' => '河南农业大学',
    'HZU' => '惠州学院',
    'BFSU' => '北京外国语大学',
    'FJPC' => '福建警察学院',
    'IMMU' => '内蒙古医科大学',
    'AQNU' => '安庆师范大学',
    'NCU' => '南昌大学',
    'WUST' => '武汉科技大学',
    'STBU' => '上海商学院',
    'HNIST' => '湖南理工学院',
    'HYTC' => '衡阳师范学院',
    'UCAS' => '中国科学院大学',
    'SZK' => '深圳信息职业技术学院',
    'UPC' => '中国石油大学（华东）',
    'CUP' => '中国石油大学（北京）',
    'THU' => '清华大学',
    'SHUPL' => '上海政法大学',
    'IMU' => '内蒙古大学',
];

// ===== 手动指定每个成员的处理 =====
// priority: manual > auto

$manualMap = [
    // === 特殊处理 ===
    '2997016663' => ['skip', '群主自己，已有账号'],
    '623372681' => ['bind', 174, 'mem', '好得很 → 复旦(成员)'],   // 复旦大学
    '2606637281' => ['bind', 17, 'mem', '光醮 → 北交(成员)'],     // 北京交通大学
    '1719210758' => ['multi', [        // 封寒修 → 成都理工(会长) + 电子科大(管理员)
        [184, 'rep'],
        [188, 'mgr'],
    ], ''],
    '3074181377' => ['bind', 227, 'rep', 'YudSu → 鲲岛galgame(台湾/会长)'],

    // === 会长 ===
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

    // === 升级管理员→会长 ===
    '2359623940' => ['bind', 167, 'rep', '恒訫ForeverZinc → 上海工程技术大学(会长)'],
    '3187115099' => ['bind', 166, 'rep', '海上明月共潮生 → 上海政法大学(会长)'],
    '3258597683' => ['bind', 175, 'rep', '红石小林 → 上海海事大学(会长)'],
    '3452016903' => ['bind', 171, 'rep', '最も澄みわたる空と海 → 东华大学(会长)'],
    '1228299407' => ['bind', 82, 'rep', '华胥明心 → 中南林业科技大学(会长)'],
    '1194837305' => ['bind', 71, 'rep', 'shakugannoshana → 中南财经政法大学(会长)'],
    '1017150127' => ['bind', 10, 'rep', 'sdp → 中国地质大学北京(会长)'],
    '1530805874' => ['bind', 7, 'rep', 'Yinleng → 中央财经大学(会长)'],
    '1309086384' => ['bind', 7, 'rep', '冰酿星滴⭐ → 中央财经大学(会长)'],
    '2848189257' => ['bind', 36, 'rep', '听一场风雪ღ → 五邑大学(会长)'],
    '2843291266' => ['bind', 25, 'rep', '若明 → 兰州大学(会长)'],
    '3358614519' => ['bind', 135, 'rep', 'るい → 内蒙古大学(会长)'],
    '2083726936' => ['bind', 14, 'rep', '彻里探侦事务所所长 → 北京化工大学(会长)'],
    '3054599619' => ['bind', 13, 'rep', 'LOGIC → 北京工业大学(会长)'],
    '2421730752' => ['bind', 11, 'rep', '小于e → 北京林业大学(会长)'],
    '1422413852' => ['bind', 12, 'rep', 'Alice → 北京科技大学(会长)'],
    '3461762751' => ['bind', 41, 'rep', '自由如风 → 北师香港浸会大学(会长)'],
    '1835631041' => ['bind', 169, 'rep', '夜、深人静 → 华东师范大学(会长)'],
    '3196076219' => ['bind', 72, 'rep', 'レイ → 华中农业大学(会长)'],
    '1361942776' => ['bind', 19, 'rep', '鹰仓茉子 → 华北电力大学(会长)'],
    '916734060' => ['bind', 97, 'rep', '破烂梦 → 南京信息工程大学(会长)'],
    '2581799489' => ['bind', 101, 'rep', '蓝zs → 南京大学(会长)'],
    '1038443783' => ['bind', 121, 'rep', 'hh → 南京工程学院(会长)'],
    '1787140968' => ['bind', 110, 'rep', 'bushi wenhe → 南京林业大学(会长)'],
    '794987708' => ['bind', 100, 'rep', 'lain → 南京航空航天大学(会长)'],
    '2087013332' => ['bind', 196, 'rep', 'mutsuki → 南开大学(会长)'],
    '1545786120' => ['bind', 93, 'rep', '雪代铃乃 → 吉林大学(会长)'],
    '1119084300' => ['bind', 229, 'rep', '字言字语 → 天津大学(会长)'],
    '824260453' => ['bind', 195, 'rep', 'z → 天津工业大学(会长)'],
    '2585341240' => ['bind', 205, 'rep', '楽園堕としのあさひ → 宁波诺丁汉大学(会长)'],
    '3053617411' => ['bind', 5, 'rep', '緋色狂咲&Crimson → 安徽大学(会长)'],
    '1937703274' => ['bind', 120, 'rep', '屿节 → 常州大学(会长)'],
    '1223152956' => ['bind', 30, 'rep', '淼月ゆうなぎ☾· → 广州商学院(会长)'],
    '1325901288' => ['bind', 47, 'rep', 'Ririko → 广西大学(会长)'],
    '3048860393' => ['bind', 46, 'rep', '今天雨也没停过 → 桂林电子科技大学(会长)'],
    '2875654849' => ['bind', 80, 'rep', 'Darkream → 武汉大学(会长)'],
    '3660328548' => ['bind', 73, 'rep', '加成 → 武汉工程大学(会长)'],
    '2057264949' => ['bind', 94, 'rep', '小泽蒸雨 → 江苏大学(会长)'],
    '3537452163' => ['bind', 119, 'rep', '天满奥杜因 → 江苏科技大学(会长)'],
    '3399696492' => ['bind', 52, 'rep', '解析体Uc207Pr4f57t9 → 河北大学(会长)'],
    '3147989638' => ['bind', 194, 'rep', '木华陽 → 河北工业大学(会长)'],
    '1040783034' => ['bind', 123, 'rep', '3B1eem4 → 河海大学(会长)'],
    '2134485260' => ['bind', 204, 'rep', '水無汐音 → 浙江万里学院(会长)'],
    '3505745887' => ['bind', 198, 'rep', '耀世微光✍ → 浙江工商大学(会长)'],
    '1410927358' => ['bind', 200, 'rep', '二階堂ぐぬぬ → 浙江科技大学(会长)'],
    '2150569060' => ['bind', 86, 'rep', '枭畔 → 湖南师范大学(会长/HNNU更正)'],
    '703918365' => ['bind', 206, 'rep', 'しずく → 温州医科大学(会长)'],
    '1445768530' => ['bind', 83, 'rep', 'Obi → 湖南大学(会长)'],
    '2575426146' => ['bind', 88, 'rep', '海滨的异乡人 → 湖南科技大学(会长)'],
    '1518475168' => ['bind', 85, 'rep', 'fishmicat → 湘潭大学(会长)'],
    '984774346' => ['bind', 53, 'rep', 'Kotorval → 燕山大学(会长)'],
    '1986560106' => ['bind', 154, 'rep', '念着倒嘛干 → 西北工业大学(会长)'],
    '2637692648' => ['bind', 26, 'rep', '忧郁的Dt君 → 西北民族大学(会长)'],
    '2932950057' => ['bind', 177, 'rep', '败火 → 西华大学(会长)'],
    '1187710717' => ['bind', 185, 'rep', 'GZH53690 → 西南交通大学(会长)'],
    '3109239278' => ['bind', 217, 'rep', '清崖 → 西南大学(会长)'],
    '3106327452' => ['bind', 187, 'rep', '幻梦 → 西南科技大学(会长)'],
    '2206124398' => ['bind', 128, 'rep', '米小包 → 赣南师范大学(会长)'],
    '2073904405' => ['bind', 220, 'rep', 'みなみな → 重庆邮电大学(会长)'],
    '2867095807' => ['bind', 87, 'rep', '海盐是个死傲娇 → 长沙理工大学(会长)'],

    // === 手动指定的其他归属 ===
    '2535019955' => ['bind', 23, 'mgr', '一扬漫远 → 厦门大学'],
    '2291247370' => ['bind', 12, 'mgr', '剑之远征 → 京都大学'],
    '3566196747' => ['bind', 6, 'mgr', '杏 → 中科大'],
    '731276775' => ['bind', 174, 'mgr', 'ミク張 → 复旦'],
    '1826144055' => ['bind', 184, 'mgr', '木台 → 成都理工'],
    '1501718818' => ['bind', 88, 'mgr', '布丁 → 湖南科大'],
    // 2013890398 and 623372681 already defined above

    // === 新增绑定（原仅建账号）===
    '3571089627' => ['bind', 1, 'mgr', 'Arts → 東京大学'],
    '3680941029' => ['bind', 1, 'mgr', '葦船2 → 東京大学'],
    '3095257101' => ['bind', 118, 'mgr', '阿托 → 淮阴师范学院'],
    '2395923213' => ['bind', 118, 'mgr', '茶丸 → 淮阴师范学院'],
    '1011118125' => ['bind', 118, 'rep', '海妖五代 → 淮阴师范学院(会长)'],
    '2064420660' => ['bind', 176, 'mgr', '傻子望天 → 四川工商学院'],
    '3051557819' => ['bind', 117, 'mgr', 'Yukikazercc → 淮阴工学院'],
    '2941113920' => ['bind', 207, 'mgr', '坂上雪中 → 杭州师范大学'],

    // === SKD更正：山东科技→上海科技 ===
    '3778324110' => ['bind', 165, 'mgr', '好名字 → 上海科技大学'],
    '2761430195' => ['bind', 165, 'mgr', '古明地_康芈子_雷 → 上海科技大学'],
];

// ===== 自动匹配函数 =====
function getAbbrFromNick($nick) {
    $upper = strtoupper($nick);
    global $abbrToSchool;
    $best = '';
    foreach ($abbrToSchool as $abbr => $school) {
        if (strpos($upper, $abbr) !== false) {
            if (strlen($abbr) > strlen($best)) $best = $abbr;
        }
    }
    return $best ? $abbrToSchool[$best] : null;
}

// ===== 主处理循环 =====
$processed = []; // qq => [action, ...]
$stats = ['account_only' => 0, 'bind_mgr' => 0, 'bind_rep' => 0, 'bind_mem' => 0, 'skip' => 0, 'no_school' => 0];

foreach ($members as $m) {
    $qq = $m['qq'];
    $nick = $m['group_nick'];

    // 跳过bot
    if (strpos($nick, '消息同步') !== false) { $stats['skip']++; continue; }

    // 检查手动指定（优先于自动匹配）
    if (isset($manualMap[$qq])) {
        $processed[$qq] = $manualMap[$qq];
        $action = $manualMap[$qq][0];
        if ($action === 'skip') $stats['skip']++;
        elseif ($action === 'bind') {
            $role = $manualMap[$qq][2];
            $stats['bind_' . ($role === 'rep' ? 'rep' : ($role === 'mem' ? 'mem' : 'mgr') )]++;
        } elseif ($action === 'multi') {
            $stats['bind_rep']++;
        }
        continue;
    }

    // AG-loli 只建账号不绑定
    if (strpos($nick, 'AG-loli') !== false) { $processed[$qq] = ['account_only']; $stats['account_only']++; continue; }

    // 自动缩写匹配
    $schoolName = getAbbrFromNick($nick);
    if ($schoolName) {
        $club = findClub($schoolName, $allClubs);
        if ($club) {
            $processed[$qq] = ['bind', $club['id'], 'mgr', ''];
            $stats['bind_mgr']++;
            continue;
        }
    }

    // 学校全名匹配
    foreach ($allClubs as $c) {
        if ($c['school'] !== '' && strpos($nick, $c['school']) !== false) {
            $processed[$qq] = ['bind', $c['id'], 'mgr', ''];
            $stats['bind_mgr']++;
            continue 2;
        }
    }

    // 特殊手动规则 - 群昵称关键词
    if (strpos($nick, '海带姬松') !== false) {
        $club = findClub('海南大学', $allClubs);
        if ($club) { $processed[$qq] = ['bind', $club['id'], 'mgr', '']; $stats['bind_mgr']++; continue; }
    }
    if (strpos($nick, '埋土小恐龙') !== false) {
        $club = findClub('成都理工大学', $allClubs);
        if ($club) { $processed[$qq] = ['bind', $club['id'], 'mgr', '']; $stats['bind_mgr']++; continue; }
    }
    if (strpos($nick, '湖科大') !== false) {
        $club = findClub('湖南科技大学', $allClubs);
        if ($club) { $processed[$qq] = ['bind', $club['id'], 'mgr', '']; $stats['bind_mgr']++; continue; }
    }
    if (strpos($nick, '南七坂') !== false) {
        $club = findClub('中国科学技术大学', $allClubs);
        if ($club) { $processed[$qq] = ['bind', $club['id'], 'mgr', '']; $stats['bind_mgr']++; continue; }
    }
    if (strpos($nick, '未来之瞳') !== false) {
        $club = findClub('西安电子科技大学', $allClubs);
        if ($club) { $processed[$qq] = ['bind', $club['id'], 'mgr', '']; $stats['bind_mgr']++; continue; }
    }
    if (strpos($nick, '九日九') !== false) {
        $club = findClub('复旦大学', $allClubs);
        if ($club) { $processed[$qq] = ['bind', $club['id'], 'mgr', '']; $stats['bind_mgr']++; continue; }
    }
    if (strpos($nick, '京美同') !== false) {
        // 京都大学
        $processed[$qq] = ['bind', 12, 'mgr', '']; $stats['bind_mgr']++; continue;
    }
    if (strpos($nick, '崇元尚武会') !== false || strpos($nick, 'OTA宅月') !== false) {
        $processed[$qq] = ['account_only']; $stats['account_only']++; continue;
    }
    if (strpos($nick, '未来之瞳') !== false || strpos($nick, '鯤島') !== false) {
        // YudSu already handled manually
        if ($qq === '3074181377') continue;
    }

    // 未匹配：只建账号
    $processed[$qq] = ['account_only'];
    $stats['account_only']++;
}

// ===== 输出SQL =====
echo "-- ============================================\n";
echo "-- 批量注册QQ成员账号\n";
echo "-- 密码: VNFest (bcrypt哈希)\n";
echo "-- 生成时间: " . date('Y-m-d H:i:s') . "\n";
echo "-- ============================================\n\n";

echo "START TRANSACTION;\n\n";

// 生成密码哈希（PHP内置bcrypt）
$passwordHash = password_hash('VNFest', PASSWORD_BCRYPT, ['cost' => 12]);

$userValues = [];
$userIdMap = []; // qq => user_id (暂用auto_increment)
$autoId = 25; // 从现有最大id 21 之后开始

// 先收集所有需要建账号的QQ，去重
$allQQ = [];
foreach ($members as $m) {
    $qq = $m['qq'];
    // 跳过: kokubun(已有) + bot
    if ($qq === '2997016663') continue;
    $nick = $m['group_nick'];
    if (strpos($nick, '消息同步') !== false) continue;
    if (!isset($processed[$qq])) continue;
    $allQQ[$qq] = $m;
}

$i = 22;
foreach ($allQQ as $qq => $m) {
    $nickname = $m['nickname'];
    $nicknameEsc = str_replace("'", "''", $nickname);
    $userValues[] = "({$i}, '{$qq}', '{$nicknameEsc}', '{$passwordHash}', 'visitor', 'active', NOW(), NOW(), NOW())";
    $userIdMap[$qq] = $i;
    $i++;
}

if ($userValues) {
    echo "INSERT INTO `users` (`id`, `username`, `nickname`, `password_hash`, `role`, `status`, `created_at`, `updated_at`, `last_login_at`) VALUES\n";
    echo implode(",\n", $userValues) . ";\n\n";
    echo "-- 更新AUTO_INCREMENT\n";
    echo "ALTER TABLE `users` AUTO_INCREMENT = {$i};\n\n";
}

// ===== 输出club_memberships =====
$memValues = [];
$mid = 15; // 现有最大14

foreach ($processed as $qq => $p) {
    if ($p[0] === 'skip' || $p[0] === 'account_only' || $p[0] === 'no_school') continue;
    if (!isset($userIdMap[$qq])) continue;
    $uid = $userIdMap[$qq];

    if ($p[0] === 'bind') {
        $clubId = $p[1];
        $role = $p[2];
        $roleSql = $role === 'rep' ? 'representative' : ($role === 'mem' ? 'member' : 'manager');
        $memValues[] = "({$mid}, {$uid}, {$clubId}, '{$roleSql}', 'active', NOW(), NULL, 0, '{$qq}', '{$roleSql}')";
        $mid++;
    } elseif ($p[0] === 'multi') {
        foreach ($p[1] as $binding) {
            $clubId = $binding[0];
            $roleSql = $binding[1] === 'rep' ? 'representative' : 'manager';
            $memValues[] = "({$mid}, {$uid}, {$clubId}, '{$roleSql}', 'active', NOW(), NULL, 0, '{$qq}', '{$roleSql}')";
            $mid++;
        }
    }
}

if ($memValues) {
    echo "INSERT INTO `club_memberships` (`id`, `user_id`, `club_id`, `role`, `status`, `joined_at`, `left_at`, `is_student`, `qq_account`, `apply_role`) VALUES\n";
    echo implode(",\n", $memValues) . ";\n\n";
    echo "ALTER TABLE `club_memberships` AUTO_INCREMENT = {$mid};\n\n";
}

echo "COMMIT;\n\n";

// ===== 统计 =====
echo "-- ============================================\n";
echo "-- 统计\n";
echo "-- ============================================\n";
echo "-- 总QQ成员: " . count($members) . "\n";
echo "-- 新建账号: " . count($userValues) . "\n";
echo "-- 绑定同好会(管理员): {$stats['bind_mgr']}\n";
echo "-- 绑定同好会(会长): {$stats['bind_rep']}\n";
echo "-- 绑定同好会(成员): {$stats['bind_mem']}\n";
echo "-- 仅建账号(无归属): {$stats['account_only']}\n";
echo "-- 跳过(bot等): " . ($stats['skip'] + $stats['no_school']) . "\n";
echo "-- 无群昵称: {$stats['no_school']}\n";
