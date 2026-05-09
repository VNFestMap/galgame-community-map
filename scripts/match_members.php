<?php
/**
 * QQ成员与同好会匹配分析 v2
 * 用法: php scripts/match_members.php
 */

$membersFile = __DIR__ . '/../data/qq_members.json';
$clubsFile = __DIR__ . '/../data/clubs.json';
$clubsJapanFile = __DIR__ . '/../data/clubs_japan.json';

// ===== 1. 读取QQ成员 =====
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
echo "====== QQ成员总数: " . count($members) . " ======\n\n";

// ===== 2. 读取同好会数据 =====
$chinaClubs = json_decode(file_get_contents($clubsFile), true);
$japanClubs = json_decode(file_get_contents($clubsJapanFile), true);

$allClubs = [];
foreach (($chinaClubs['data'] ?? []) as $c) {
    $allClubs[] = [
        'id' => $c['id'],
        'country' => 'china',
        'province' => $c['province'] ?? '',
        'school' => $c['school'] ?? '',
        'name' => $c['name'] ?? '',
    ];
}
foreach (($japanClubs['data'] ?? []) as $c) {
    $allClubs[] = [
        'id' => $c['id'],
        'country' => 'japan',
        'province' => $c['prefecture'] ?? $c['province'] ?? '',
        'school' => $c['school'] ?? '',
        'name' => $c['name'] ?? '',
    ];
}

// 构建学校全名索引
$schoolIndex = [];
foreach ($allClubs as $c) {
    $key = str_replace(['（', '）', ' ', '　'], ['(', ')', '', ''], $c['school']);
    $schoolIndex[strtolower(trim($key))] = $c;
    // 也索引简称
    $short = preg_replace('/[（(].*?[）)]/u', '', $c['school']);
    $short = trim($short);
    if ($short !== $c['school']) {
        $schoolIndex[strtolower($short)] = $c;
    }
}

// 完整缩写映射
$abbrMap = [
    'YCIT' => '盐城工学院', 'CDUT' => '成都理工大学', 'UESTC' => '电子科技大学',
    'CSUST' => '长沙理工大学', 'BJTU' => '北京交通大学', 'FDU' => '复旦大学',
    'WHU' => '武汉大学', 'NUIST' => '南京信息工程大学', 'CSUFT' => '中南林业科技大学',
    'XTU' => '湘潭大学', 'SWUST' => '西南科技大学', 'ZJNU' => '浙江师范大学',
    'SWUPL' => '西南政法大学', 'HNUST' => '湖南科技大学', 'USC' => '南华大学',
    'HUST' => '华中科技大学', 'XHU' => '西华大学', 'HYTC' => '衡阳师范学院',
    'BUCT' => '北京化工大学', 'WUST' => '武汉科技大学', 'AHU' => '安徽大学',
    'SDU' => '山东大学', 'LZU' => '兰州大学', 'DHU' => '东华大学',
    'CUFE' => '中央财经大学', 'CQUT' => '重庆理工大学', 'PKU' => '北京大学',
    'JLU' => '吉林大学', 'NKU' => '南开大学', 'NBU' => '宁波大学',
    'SJTU' => '上海交通大学', 'CSU' => '中南大学', 'STBU' => '上海商学院',
    'SICAU' => '四川农业大学', 'HAU' => '河南农业大学', 'HZNU' => '杭州师范大学',
    'HNIST' => '湖南理工学院', 'ZUEL' => '中南财经政法大学', 'HZAU' => '华中农业大学',
    'CUG' => '中国地质大学（武汉）', 'WUT' => '武汉理工大学', 'CUP' => '中国石油大学（北京）',
    'WYU' => '五邑大学', 'TGU' => '天津工业大学', 'WIT' => '武汉工程大学',
    'TUT' => '天津理工大学', 'NJFU' => '南京林业大学', 'SCU' => '四川大学',
    'SUES' => '上海工程技术大学', 'CUGB' => '中国地质大学（北京）',
    'SHU' => '上海大学', 'NJU' => '南京大学', 'HBU' => '河北大学',
    'USTC' => '中国科学技术大学', 'FJPC' => '福建警察学院', 'NCU' => '南昌大学',
    'IMU' => '内蒙古大学', 'IMMU' => '内蒙古医科大学', 'USTB' => '北京科技大学',
    'BJUT' => '北京工业大学', 'ECNU' => '华东师范大学', 'GUET' => '桂林电子科技大学',
    'GXU' => '广西大学', 'AQNU' => '安庆师范大学', 'ZJSU' => '浙江工商大学',
    'CQUPT' => '重庆邮电大学', 'UJS' => '江苏大学', 'BFSU' => '北京外国语大学',
    'SMU' => '上海海事大学', 'HZU' => '惠州学院', 'UCAS' => '中国科学院大学',
    'GCC' => '广州商学院', 'HHU' => '河海大学', 'NCEPU' => '华北电力大学',
    'YSU' => '燕山大学', 'HEBUT' => '河北工业大学', 'SWU' => '西南大学',
    'SWJTU' => '西南交通大学', 'GDOU' => '广东海洋大学', 'ZUST' => '浙江科技大学',
    'SZK' => '深圳信息职业技术学院', 'UPC' => '中国石油大学（华东）',
    'SZU' => '深圳大学', 'XMU' => '厦门大学', 'BJFU' => '北京林业大学',
    'ZWU' => '浙江万里学院', 'NWMU' => '西北民族大学', 'CCZU' => '常州大学',
    'SHUPL' => '上海政法大学', 'HNU' => '湖南大学', 'BNBU' => '北师香港浸会大学',
    'JUST' => '江苏科技大学', 'TJU' => '天津大学', 'UNNC' => '宁波诺丁汉大学',
    'NUAA' => '南京航天航空大学', 'GNSD' => '赣南师范大学', 'HNNU' => '海南师范大学',
    'THU' => '清华大学', 'NPU' => '西北工业大学', 'WMU' => '温州医科大学',
    'SKD' => '山东科技大学', 'NJIT' => '南京工程学院', 'UTVINOS' => '東京大学',
    'UNSW' => '新南威尔士大学',
];

function findClubBySchool($schoolName, $allClubs) {
    $clean1 = str_replace(['（', '）', ' ', '　'], ['(', ')', '', ''], $schoolName);
    foreach ($allClubs as $c) {
        $clean2 = str_replace(['（', '）', ' ', '　'], ['(', ')', '', ''], $c['school']);
        if (strtolower(trim($clean1)) === strtolower(trim($clean2))) return $c;
        // 部分匹配
        if (strpos($clean1, $clean2) !== false || strpos($clean2, $clean1) !== false) return $c;
    }
    return null;
}

// 需要新建同好会的学校列表
$needNewClub = [];

// ===== 3. 匹配 =====
$matched = [];
$unmatched = [];

foreach ($members as $m) {
    $g = $m['group_nick'];
    $club = null;
    $reason = '';

    // 跳过bot
    if (strpos($g, '消息同步') !== false) {
        $matched[] = ['member' => $m, 'club' => null, 'reason' => '消息同步bot'];
        continue;
    }
    if (trim($g) === '' || trim($g) === '☁️') {
        $unmatched[] = $m;
        continue;
    }

    // 方法1: 群昵称包含学校全名
    foreach ($allClubs as $c) {
        if ($c['school'] !== '' && strpos($g, $c['school']) !== false) {
            $club = $c;
            $reason = '学校全名: ' . $c['school'];
            break;
        }
    }
    if ($club) goto found;

    // 方法2: 提取缩写（任意位置，不要求独立单词）
    $gUpper = strtoupper($g);
    // 对每个缩写检查是否是群昵称的子串
    $matchedAbbr = '';
    foreach ($abbrMap as $abbr => $school) {
        if ($abbr === '' || $school === '') continue;
        if (strpos($gUpper, $abbr) !== false) {
            // 优先匹配最长缩写
            if (strlen($abbr) > strlen($matchedAbbr)) {
                $matchedAbbr = $abbr;
            }
        }
    }
    if ($matchedAbbr !== '') {
        $schoolName = $abbrMap[$matchedAbbr];
        if ($schoolName === '東京大学') {
            // 日本学校
            foreach ($allClubs as $c) {
                if ($c['country'] === 'japan' && strpos($c['school'], '東京大学') !== false) {
                    $club = $c; break;
                }
            }
        } else {
            $club = findClubBySchool($schoolName, $allClubs);
        }
        if ($club) {
            $reason = "缩写匹配: {$matchedAbbr} → {$schoolName}";
            goto found;
        } else {
            // 缩写能识别但学校不在系统中
            $needNewClub[$schoolName] = $schoolName;
            $reason = "识别到学校【{$schoolName}】(需新建同好会)";
            goto found;
        }
    }

    // 方法3: 关键词匹配（去掉空格）
    $clean = preg_replace('/[[:punct:]&\s]+/u', '', $g);
    foreach ($allClubs as $c) {
        $cs = str_replace([' ', '　'], '', $c['school']);
        if ($cs !== '' && strpos($cs, substr($clean, 0, 6)) !== false) {
            $club = $c;
            $reason = '关键词匹配: ' . $c['school'];
            break;
        }
    }

    found:
    if ($club) {
        $matched[] = ['member' => $m, 'club' => $club, 'reason' => $reason];
    } else {
        $unmatched[] = $m;
    }
}

// ===== 4. 输出结果 =====
$groups = [];
foreach ($matched as $item) {
    if ($item['club'] === null) continue;
    $key = $item['club']['school'] . '|||' . $item['club']['id'];
    $groups[$key][] = $item;
}
ksort($groups);

echo "--- 已匹配成员（按同好会分组）---\n\n";
foreach ($groups as $key => $items) {
    $club = $items[0]['club'];
    $cnt = count($items);
    echo "【{$club['school']}】{$club['name']} (ID:{$club['id']}, {$club['country']}) - {$cnt}人\n";
    foreach ($items as $item) {
        $mm = $item['member'];
        echo "  QQ:{$mm['qq']} | 昵称:{$mm['nickname']} | {$item['reason']}\n";
    }
    echo "\n";
}

$matchedReal = 0;
foreach ($matched as $m) { if ($m['club'] !== null) $matchedReal++; }

echo "========================================\n";
echo "--- 未匹配成员 (无法识别学校的) ---\n";
foreach ($unmatched as $m) {
    echo "QQ:{$m['qq']} | 昵称:{$m['nickname']} | 群昵称:{$m['group_nick']}\n";
}
echo "\n";

echo "--- 需要新建同好会的学校 ---\n";
foreach ($needNewClub as $s) {
    echo "  {$s}\n";
}
echo "\n";

echo "匹配结果统计:\n";
echo "  已匹配到同好会: {$matchedReal} 人\n";
echo "  消息同步bot: 1 人\n";
echo "  未匹配(需确认): " . count($unmatched) . " 人\n";
echo "  需新建同好会的学校: " . count($needNewClub) . " 所\n";
