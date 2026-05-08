// ==========================================
// 全国 Galgame 同好会地图 - 完整版
// ==========================================

// ==========================================
// 1. 常量与全局状态管理
// ==========================================
const CONFIG = {
  BASE_WIDTH: 960,
  BASE_HEIGHT: 700,
  API_URL: './data/clubs.json',
  FALLBACK_URLS: ['./data/clubs.json'],
  POLYMERIZATION_URL: ''
};

const State = {
  bandoriRows: [],
  provinceGroupsMap: new Map(),
  selectedProvinceKey: null,
  mapViewState: null,
  selectedCardAnimToken: 0,
  activeBubbleState: null,
  bubbleAnimToken: 0,
  invertCtrlBubble: false,
  developerModeEnabled: false,
  globalSearchEnabled: false,
  themePreference: 'system',
  systemThemeMediaQuery: null,
  currentDetailProvinceName: '',
  currentDetailRows: [],
  listQuery: '',
  listType: 'all',
  listSort: 'default',
  currentDataSource: 'none',
  mobileSheetHeightPx: null,
  resetClickBurstCount: 0,
  resetClickBurstTimer: null,
  currentCountry: 'china',
  japanRows: [],
  japanGroupsMap: new Map()
};

let adminMode = false;
let currentEditClubId = null;
let ADMIN_PASSWORD = '';

// 页面加载时获取配置
fetch('./api/get_config.php')
    .then(res => res.json())
    .then(config => {
        ADMIN_PASSWORD = config.admin_token;
    });

function isAdminMode() {
    return localStorage.getItem('admin_token') === ADMIN_PASSWORD;
}

const Utils = {
  isMobileViewport: () => window.matchMedia('(max-width: 720px)').matches,
  extractUrl: (item) => {
    const source = `${item?.name || ''} ${item?.raw_text || ''} ${item?.info || ''}`;
    const match = source.match(/https?:\/\/[^\s]+|discord\.gg\/[^\s]+|discord\.com\/invite\/[^\s]+/i);
    if (!match) return null;
    const raw = match[0];
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  },
  normalizeProvinceName: (name) => {
    if (!name) return '';
    return String(name).trim().replace(/(壮族自治区|回族自治区|维吾尔自治区|特别行政区|自治区|省|市)$/g, '');
  },
  groupTypeText: (type) => ({ school: '高校同好会', region: '地区高校联合', 'vnfest': '视觉小说学园祭' }[type] || '其他'),
  typeFilterValue: (type) => ({ school: 'school', region: 'region', 'vnfest': 'vnfest' }[type] || 'other'),
  formatCreatedAt: (value) => {
    if (!value) return '成立时间未知';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },
  escapeHTML: (value) => String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
  debounce: (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

function showToast(message, duration = 2000) {
    let toast = document.getElementById('mobileToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mobileToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) scale(0.9);
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            color: white;
            padding: 10px 20px;
            border-radius: 40px;
            font-size: 13px;
            z-index: 1000;
            opacity: 0;
            transition: all 0.2s ease;
            pointer-events: none;
            text-align: center;
            line-height: 1.4;
            white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) scale(1)';
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) scale(0.9)';
    }, duration);
}

// ==========================================
// 多语言配置
// ==========================================
const translations = {
    zh: {
        // 标题与简介
        title: '全国Galgame同好会地图',
        introTitle: '全国Galgame同好会地图',
        intro: '本网站聚合展示全国各省、高校及海外地区的 Galgame / 视觉小说同好组织信息。支持地图缩放拖拽、分省查看、分类筛选、关键词搜索，一键复制联系方式，帮助同好快速找到组织。',
        dataSource: '数据源：',
        
        // 搜索与筛选
        searchPlaceholder: '搜索组织名 / 群号 / 学校',
        typeAll: '全部',
        typeRegion: '地区高校联合',
        typeSchool: '高校同好会',
        typeVnfest: '视觉小说学园祭',
        sortDefault: '默认排序',
        sortTime: '成立时间',
        sortName: '名称排序',
        sortType: '类型排序',
        globalSearch: '全局搜索',
        
        // 地图按钮
        chinaBtn: '中国同好会',
        japanBtn: '日本同好会',
        otherBtn: '海外同好会',
        calendarBtn: '活动日历',
        publicationBtn: '刊物投稿',
        
        // 地图控件
        zoomIn: '放大 +',
        zoomOut: '缩小 -',
        reset: '重置视图',
        clubCount: '个组织',
        mapControls: '地图控件',
        
        // 链接与提交
        openSource: '开源仓库',
        submitClub: '提交同好会',
        submitEvent: '添加活动',
        
        // 开关
        invertCtrl: '反转操作 (Ctrl+点击查看详情)',
        invertCtrlOn: '反转操作已开启',
        themeMode: '深色模式 (跟随系统)',
        themeLight: '深色模式 (开启)',
        themeDark: '深色模式 (关闭)',
        
        // 卡片提示
        clickExpand: '点击展开',
        clickCollapse: '点击收起',
        noData: '点击地图上的地区查看同好会信息',
        noClub: '暂无同好会信息，欢迎提交~',
        noPublication: '暂无刊物信息，欢迎投稿~',
        
        // 弹窗
        feedback: '反馈',
        easterEgg: '🎉 彩蛋',
        
        // 详情面板
        detailProvince: '所在地',
        detailType: '组织类型',
        detailContact: '联系方式',
        detailCopy: '复制',
        detailOpenLink: '打开链接',
        detailCopyLink: '复制链接',
        detailIntro: '介绍',
        detailNoRemark: '暂无介绍，欢迎补充~',
        detailEstablished: '成立时间',
        detailVerified: '已认证',
        detailUnverified: '未认证',
        
        // 管理员面板
        adminAddTitle: '➕ 添加同好会',
        adminEditTitle: '✏️ 编辑同好会',
        adminName: '组织名称 *',
        adminProvince: '省份 *',
        adminPrefecture: '都道府县 *',
        adminCountry: '国家',
        adminType: '组织类型',
        adminContact: '联系方式 *',
        adminRemark: '详细介绍...',
        adminSchool: '学校/组织',
        adminCancel: '取消',
        adminSave: '保存',
        adminDelete: '删除',
        
        // 日历
        calendarTitle: 'Galgame 活动日历',
        calendarPrev: '‹ 上月',
        calendarNext: '下月 ›',
        calendarAddEvent: '➕ 添加活动',
        calendarEventName: '活动名称',
        calendarEventDate: '活动日期',
        calendarEventDesc: '活动简介',
        calendarEventImage: '宣传图文件名',
        calendarEventLink: '活动链接',
        calendarEventDetail: '详细介绍',
        calendarOfficial: '官方活动',
        calendarNoEvent: '本月有 {{count}} 个 Galgame 活动',
        
        // 刊物
        publicationTitle: '📖 同好会刊物列表',
        publicationAdd: '➕ 添加刊物',
        publicationName: '刊物名称',
        publicationClub: '主办同好会',
        publicationStatus: '制作状态',
        publicationStatusPlanning: '📋 策划中',
        publicationStatusWriting: '✍️ 征稿中',
        publicationStatusEditing: '🔧 编辑中',
        publicationStatusPublishing: '📢 即将发布',
        publicationStatusCompleted: '✅ 已发布',
        publicationStatusSuspended: '⏸️ 暂停',
        publicationSubmitLink: '投稿入口',
        publicationDeadline: '截止日期',
        publicationDesc: '刊物介绍',
        
        // 提交表单
        submitTitle: '提交同好会信息',
        submitSubtitle: '你的贡献将帮助更多同好找到组织 ✨',
        submitSuccess: '✅ 提交成功！感谢你的贡献，我们会尽快审核。',
        submitError: '❌ 提交失败，请稍后重试或联系管理员。',
        submitName: '学校/组织名称 *',
        submitCountry: '所属国家 *',
        submitProvince: '省份 *',
        submitPrefecture: '都道府县 *',
        submitContact: '联系方式 *',
        submitContactHint: 'QQ群、微信群、Discord、Telegram 等均可',
        submitType: '组织类型 *',
        submitTypeSchool: '高校同好会',
        submitTypeRegion: '地区高校联合',
        submitTypeVnfest: '视觉小说学园祭',
        submitCreatedAt: '成立时间',
        submitRemark: '群简介 / 备注',
        submitSubmitter: '你的联系方式',
        submitSubmitterHint: '仅用于审核沟通，不会公开',
        submitButton: '✉️ 提交信息',
        submitInfo: '⭐ 提交后，管理员会尽快审核'
    },
    ja: {
        // タイトルと紹介
        title: '全国ギャルゲー同好会マップ',
        introTitle: '全国ギャルゲー同好会マップ',
        intro: '全国の大学、地域、海外のギャルゲー・ビジュアルノベル同好会情報を集約したマップです。地図の拡大縮小、ドラッグ、都道府県別表示、カテゴリ絞り込み、キーワード検索、連絡先のコピーが可能です。',
        dataSource: 'データソース：',
        
        // 検索と絞り込み
        searchPlaceholder: '団体名 / グループID / 学校名で検索',
        typeAll: 'すべて',
        typeRegion: '地域大学連合',
        typeSchool: '大学同好会',
        typeVnfest: 'ビジュアルノベル祭',
        sortDefault: 'デフォルト',
        sortTime: '設立日順',
        sortName: '名前順',
        sortType: 'タイプ順',
        globalSearch: '全体検索',
        
        // 地図ボタン
        chinaBtn: '中国サークル',
        japanBtn: '日本サークル',
        otherBtn: '他のサークル',
        calendarBtn: 'カレンダー',
        publicationBtn: '投稿募集',
        
        // 地図コントロール
        zoomIn: '拡大 +',
        zoomOut: '縮小 -',
        reset: 'リセット',
        clubCount: '団体',
        mapControls: '地図操作',
        
        // リンクと投稿
        openSource: 'オープンソース',
        submitClub: '同好会を投稿',
        submitEvent: 'イベントを追加',
        
        // スイッチ
        invertCtrl: '操作反転 (Ctrl+クリックで詳細表示)',
        invertCtrlOn: '操作反転オン',
        themeMode: 'ダークモード (システム連動)',
        themeLight: 'ダークモード (オン)',
        themeDark: 'ダークモード (オフ)',
        
        // カード表示
        clickExpand: 'クリックで展開',
        clickCollapse: 'クリックで閉じる',
        noData: '地図上の地域をクリックして同好会情報を表示',
        noClub: '同好会情報はまだありません。投稿をお待ちしています～',
        noPublication: '出版物情報はまだありません。投稿をお待ちしています～',
        
        // モーダル
        feedback: 'フィードバック',
        easterEgg: '🎉 イースターエッグ',
        
        // 詳細パネル
        detailProvince: '所在地',
        detailType: '団体タイプ',
        detailContact: '連絡先',
        detailCopy: 'コピー',
        detailOpenLink: 'リンクを開く',
        detailCopyLink: 'リンクをコピー',
        detailIntro: '紹介',
        detailNoRemark: '紹介文はありません。募集しています～',
        detailEstablished: '設立日',
        detailVerified: '認証済み',
        detailUnverified: '未認証',
        
        // 管理者パネル
        adminAddTitle: '➕ 同好会を追加',
        adminEditTitle: '✏️ 同好会を編集',
        adminName: '団体名 *',
        adminProvince: '省 *',
        adminPrefecture: '都道府県 *',
        adminCountry: '国',
        adminType: '団体タイプ',
        adminContact: '連絡先 *',
        adminRemark: '詳細紹介...',
        adminSchool: '学校/団体',
        adminCancel: 'キャンセル',
        adminSave: '保存',
        adminDelete: '削除',
        
        // カレンダー
        calendarTitle: 'ギャルゲー イベントカレンダー',
        calendarPrev: '‹ 前月',
        calendarNext: '次月 ›',
        calendarAddEvent: '➕ イベントを追加',
        calendarEventName: 'イベント名',
        calendarEventDate: '開催日',
        calendarEventDesc: 'イベント概要',
        calendarEventImage: '画像ファイル名',
        calendarEventLink: 'イベントリンク',
        calendarEventDetail: '詳細説明',
        calendarOfficial: '公式イベント',
        calendarNoEvent: '今月は {{count}} 件のギャルゲーイベントがあります',
        
        // 出版物
        publicationTitle: '📖 同好会出版物リスト',
        publicationAdd: '➕ 出版物を追加',
        publicationName: '出版物名',
        publicationClub: '主催同好会',
        publicationStatus: '制作状況',
        publicationStatusPlanning: '📋 企画中',
        publicationStatusWriting: '✍️ 募集中',
        publicationStatusEditing: '🔧 編集中',
        publicationStatusPublishing: '📢 近日公開',
        publicationStatusCompleted: '✅ 公開済み',
        publicationStatusSuspended: '⏸️ 休止中',
        publicationSubmitLink: '投稿はこちら',
        publicationDeadline: '締切日',
        publicationDesc: '出版物紹介',
        
        // 投稿フォーム
        submitTitle: '同好会情報を投稿',
        submitSubtitle: 'あなたの貢献で仲間が見つかります ✨',
        submitSuccess: '✅ 投稿成功！ご協力ありがとうございます。審査後、公開されます。',
        submitError: '❌ 投稿失敗。しばらく経ってから再試行するか、管理者に連絡してください。',
        submitName: '学校/団体名 *',
        submitCountry: '国 *',
        submitProvince: '省 *',
        submitPrefecture: '都道府県 *',
        submitContact: '連絡先 *',
        submitContactHint: 'QQグループ、WeChat、Discord、Telegramなど',
        submitType: '団体タイプ *',
        submitTypeSchool: '大学同好会',
        submitTypeRegion: '地域大学連合',
        submitTypeVnfest: 'ビジュアルノベル祭',
        submitCreatedAt: '設立日',
        submitRemark: '団体紹介 / 備考',
        submitSubmitter: 'あなたの連絡先',
        submitSubmitterHint: '審査連絡用（公開されません）',
        submitButton: '✉️ 投稿する',
        submitInfo: '⭐ 投稿後、管理者が審査します'
    }
};

let currentLang = 'zh';

function updateUILanguage() {
    const t = translations[currentLang];
    if (!t) return;
    
    document.getElementById('selectedTitle').textContent = t.title;
    const introTitle = document.getElementById('introTitle');
    if (introTitle) introTitle.textContent = t.introTitle;
    const introBody = document.querySelector('#introCard .card-body');
    if (introBody) introBody.textContent = t.intro;
    
    const invertLabel = document.getElementById('invertCtrlLabel');
    if (invertLabel) {
        if (State.invertCtrlBubble) {
            invertLabel.textContent = t.invertCtrlOn;
        } else {
            invertLabel.textContent = t.invertCtrl;
        }
    }
    
    const themeLabel = document.getElementById('themeSwitchLabel');
    if (themeLabel) {
        const effectiveTheme = getPreferredTheme();
        if (State.themePreference === 'system') {
            themeLabel.textContent = t.themeMode;
        } else {
            themeLabel.textContent = effectiveTheme === 'dark' ? t.themeLight : t.themeDark;
        }
    }
    
    const chinaBtn = document.getElementById('chinaToggleBtn');
    const japanBtn = document.getElementById('japanToggleBtn');
    const otherBtn = document.getElementById('otherToggleBtn');
    const calendarBtn = document.getElementById('calendarToggleBtn');
    const publicationBtn = document.getElementById('publicationToggleBtn');
    if (chinaBtn) chinaBtn.textContent = t.chinaBtn;
    if (japanBtn) japanBtn.textContent = t.japanBtn;
    if (otherBtn) otherBtn.textContent = t.otherBtn;
    if (calendarBtn) calendarBtn.textContent = t.calendarBtn;
    if (publicationBtn) publicationBtn.textContent = t.publicationBtn;
    
    const controlTitle = document.querySelector('#controlCard .card-title');
    if (controlTitle) controlTitle.textContent = t.mapControls;
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    if (zoomInBtn) zoomInBtn.textContent = t.zoomIn;
    if (zoomOutBtn) zoomOutBtn.textContent = t.zoomOut;
    if (resetViewBtn) resetViewBtn.textContent = t.reset;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter && typeFilter.options) {
        if (typeFilter.options[0]) typeFilter.options[0].text = t.typeAll;
        if (typeFilter.options[1]) typeFilter.options[1].text = t.typeRegion;
        if (typeFilter.options[2]) typeFilter.options[2].text = t.typeSchool;
        if (typeFilter.options[3]) typeFilter.options[3].text = t.typeVnfest;
    }
    
    const sortBtns = document.querySelectorAll('.sort-btn');
    if (sortBtns.length >= 4) {
        sortBtns[0].textContent = t.sortDefault;
        sortBtns[1].textContent = t.sortTime;
        sortBtns[2].textContent = t.sortName;
        sortBtns[3].textContent = t.sortType;
    }
    
    const searchModeBtn = document.getElementById('globalSearchBtn');
    if (searchModeBtn) {
        const label = searchModeBtn.querySelector('.search-label');
        if (label) label.textContent = t.globalSearch;
    }
    
    const selectedMeta = document.getElementById('selectedMeta');
    if (selectedMeta && State.currentDataSource) {
        selectedMeta.textContent = t.dataSource + State.currentDataSource;
    }
    
    const selectedProvince = document.getElementById('selectedProvince');
    if (selectedProvince) {
        const match = selectedProvince.textContent.match(/\d+/);
        if (match) {
            selectedProvince.textContent = match[0] + ' ' + t.clubCount;
        }
    }
    
    const submitClubBtn = document.getElementById('submitClubBtn');
    const submitEventBtn = document.getElementById('submitEventBtn');
    if (submitClubBtn) submitClubBtn.innerHTML = `📝 ${t.submitClub}`;
    if (submitEventBtn) submitEventBtn.innerHTML = `📅 ${t.submitEvent}`;
    
    const emptyTexts = document.querySelectorAll('.empty-text');
    emptyTexts.forEach(el => {
        if (el.textContent.includes('点击地图省份')) {
            el.textContent = t.noData;
        } else if (el.textContent.includes('暂无同好会信息')) {
            el.textContent = t.noClub;
        } else if (el.textContent.includes('暂无刊物信息')) {
            el.textContent = t.noPublication;
        }
    });
    
    const zhBtn = document.getElementById('langZhBtn');
    const jaBtn = document.getElementById('langJaBtn');
    if (zhBtn && jaBtn) {
        if (currentLang === 'zh') {
            zhBtn.classList.add('active');
            jaBtn.classList.remove('active');
        } else {
            zhBtn.classList.remove('active');
            jaBtn.classList.add('active');
        }
    }
    
    console.log('✅ 界面语言已切换为:', currentLang === 'zh' ? '中文' : '日本語');
}

// ==========================================
// UI 与 DOM 操作函数
// ==========================================
function applyMobileModeLayout() {
  const els = {
    map: document.getElementById('map'),
    selectedCard: document.getElementById('selectedCard'),
    overseasBtn: document.getElementById('overseasToggleBtn'),
    sheetHandle: document.getElementById('mobileSheetHandle'),
    controlCard: document.getElementById('controlCard'),
    introCard: document.getElementById('introCard')
  };
  if (!els.map || !els.selectedCard || !els.overseasBtn || !els.controlCard || !els.introCard || !els.sheetHandle) return;

  const nonRegionalBtn = document.getElementById('nonRegionalToggleBtn');
  const calendarBtn = document.getElementById('calendarToggleBtn');

  if (Utils.isMobileViewport()) {
    if (els.overseasBtn.parentElement !== els.selectedCard || els.sheetHandle.parentElement !== els.selectedCard) {
      els.selectedCard.insertBefore(els.sheetHandle, els.selectedCard.firstChild);
      els.selectedCard.insertBefore(els.overseasBtn, els.sheetHandle.nextSibling);
      if (nonRegionalBtn) {
        els.selectedCard.insertBefore(nonRegionalBtn, els.overseasBtn.nextSibling);
      }
      if (calendarBtn) {
        els.selectedCard.insertBefore(calendarBtn, (nonRegionalBtn || els.overseasBtn).nextSibling);
      }
    }
    els.overseasBtn.classList.add('mobile-inside');
    nonRegionalBtn?.classList.add('mobile-inside');
    calendarBtn?.classList.add('mobile-inside');
    els.controlCard.classList.add('mobile-hidden');
    els.introCard.classList.add('collapsed');

    if (State.mobileSheetHeightPx) {
      els.selectedCard.style.height = `${State.mobileSheetHeightPx}px`;
    } else if (!els.selectedCard.style.height) {
      els.selectedCard.style.height = '46vh';
    }
  } else {
    if (els.overseasBtn.parentElement !== els.map) {
      els.map.insertBefore(els.overseasBtn, els.controlCard);
    }
    if (nonRegionalBtn && nonRegionalBtn.parentElement !== els.map) {
      els.map.insertBefore(nonRegionalBtn, els.controlCard);
    }
    if (calendarBtn && calendarBtn.parentElement !== els.map) {
      els.map.insertBefore(calendarBtn, els.controlCard);
    }
    if (els.sheetHandle.parentElement !== els.map) {
      els.map.insertBefore(els.sheetHandle, els.controlCard);
    }
    els.overseasBtn.classList.remove('mobile-inside');
    nonRegionalBtn?.classList.remove('mobile-inside');
    calendarBtn?.classList.remove('mobile-inside');
    els.controlCard.classList.remove('mobile-hidden');
    els.selectedCard.style.height = '';
  }
}

function getPreferredTheme() {
  if (State.themePreference === 'light' || State.themePreference === 'dark') return State.themePreference;
  return State.systemThemeMediaQuery?.matches ? 'dark' : 'light';
}

function updateThemeMetaColor(theme) {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!metaThemeColor) return;
  metaThemeColor.setAttribute('content', theme === 'dark' ? '#140913' : '#9b59b6');

  const supportsDynamicThemeColor = window.matchMedia('(display-mode: browser)').matches || window.matchMedia('(display-mode: standalone)').matches;
  if (supportsDynamicThemeColor) {
    document.documentElement.style.setProperty('background-color', theme === 'dark' ? '#140913' : '#fff7fa');
    document.body.style.setProperty('background-color', theme === 'dark' ? '#140913' : '#fff7fa');
  }
}

function updateThemeSwitchUI() {
  const themeSwitch = document.getElementById('themeSwitch');
  const label = document.getElementById('themeSwitchLabel');
  const effectiveTheme = getPreferredTheme();
  if (themeSwitch) themeSwitch.checked = effectiveTheme === 'dark';
  if (label) {
    label.textContent = State.themePreference === 'system'
      ? `暗黑模式（跟随系统：${effectiveTheme === 'dark' ? '开' : '关'}）`
      : `暗黑模式（临时${effectiveTheme === 'dark' ? '开启' : '关闭'}）`;
  }
}

function applyThemePreference() {
  const effectiveTheme = getPreferredTheme();
  if (State.themePreference === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }
  updateThemeMetaColor(effectiveTheme);
  updateThemeSwitchUI();
}

function setThemePreference(preference) {
  State.themePreference = preference;
  applyThemePreference();
}

function initThemePreference() {
  State.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemThemeChange = () => {
    if (State.themePreference === 'system') applyThemePreference();
  };

  if (typeof State.systemThemeMediaQuery.addEventListener === 'function') {
    State.systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
  } else if (typeof State.systemThemeMediaQuery.addListener === 'function') {
    State.systemThemeMediaQuery.addListener(handleSystemThemeChange);
  }

  applyThemePreference();
}

function bindMobileSheetResize() {
  const handle = document.getElementById('mobileSheetHandle');
  const card = document.getElementById('selectedCard');
  if (!handle || !card || handle.dataset.bound === 'true') return;
  handle.dataset.bound = 'true';

  let startY = 0;
  let startHeight = 0;
  let dragging = false;

  const minHeight = () => Math.round(window.innerHeight * 0.28);
  const maxHeight = () => Math.round(window.innerHeight * 0.82);

  const updateHeight = (clientY) => {
    const delta = startY - clientY;
    const next = Math.max(minHeight(), Math.min(maxHeight(), startHeight + delta));
    State.mobileSheetHeightPx = next;
    card.style.height = `${next}px`;
  };

  const onMouseMove = (e) => {
    if (!dragging || !Utils.isMobileViewport()) return;
    updateHeight(e.clientY);
  };

  const onTouchMove = (e) => {
    if (!dragging || !Utils.isMobileViewport()) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    updateHeight(touch.clientY);
    e.preventDefault();
  };

  const stopDrag = () => {
    dragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', stopDrag);
  };

  const startDrag = (clientY) => {
    if (!Utils.isMobileViewport()) return;
    dragging = true;
    startY = clientY;
    startHeight = card.getBoundingClientRect().height;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', stopDrag);
  };

  handle.addEventListener('mousedown', (e) => startDrag(e.clientY));
  handle.addEventListener('touchstart', (e) => {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    startDrag(touch.clientY);
  }, { passive: true });
}

function setGlobalSearchEnabled(enabled, options = { resetToDefault: false }) {
    State.globalSearchEnabled = !!enabled;
    const btn = document.getElementById('globalSearchBtn');
    
    if (btn) {
        btn.classList.toggle('active', State.globalSearchEnabled);
        btn.setAttribute('aria-pressed', State.globalSearchEnabled ? 'true' : 'false');
    }
    
    if (State.globalSearchEnabled) {
        // 进入全局搜索模式
        State.selectedProvinceKey = null;
        State.currentDetailProvinceName = '';
        State.currentDetailRows = [];
        
        if (State.mapViewState?.g) {
            State.mapViewState.g.selectAll('.province').classed('selected', false);
        }
        
        // 清空搜索输入框的占位提示，但保留搜索词
        renderCurrentDetail();
    } else if (options.resetToDefault) {
        // 退出全局搜索模式，恢复默认
        State.selectedProvinceKey = null;
        State.currentDetailProvinceName = '';
        State.currentDetailRows = [];
        hideMapBubble();
        updateSummaryUI(State.currentDataSource);
        renderCurrentDetail();
    }
}

function updateSortButtonView() {
  const sortBar = document.getElementById('sortBar');
  if (!sortBar) return;

  sortBar.querySelectorAll('.sort-btn').forEach((btn) => {
    const key = btn.getAttribute('data-sort') || '';
    btn.classList.remove('active');

    const config = {
      default: { text: '默认', active: State.listSort === 'default', next: 'default' },
      time_desc: { text: State.listSort === 'time_asc' ? '成立时间 ↑' : '成立时间 ↓', active: ['time_asc', 'time_desc'].includes(State.listSort), next: State.listSort === 'time_asc' ? 'time_asc' : 'time_desc' },
      name_asc: { text: State.listSort === 'name_desc' ? '首字母 Z→A' : '首字母 A→Z', active: ['name_asc', 'name_desc'].includes(State.listSort), next: State.listSort === 'name_desc' ? 'name_desc' : 'name_asc' },
      type_asc: { text: State.listSort === 'type_desc' ? '类型 Z→A' : '类型 A→Z', active: ['type_asc', 'type_desc'].includes(State.listSort), next: State.listSort === 'type_desc' ? 'type_desc' : 'type_asc' }
    };

    const targetConfig = config[key.split('_')[0] + (key.includes('desc') ? '_desc' : (key === 'default' ? '' : '_asc'))] || config[key];
    
    if (targetConfig) {
      btn.textContent = targetConfig.text;
      if (targetConfig.active) btn.classList.add('active');
      btn.setAttribute('data-sort', targetConfig.next);
    }
  });
}

function getFilteredSortedRows(rows) {
    if (!rows || !Array.isArray(rows)) return [];
    
    let result = [...rows];
    
    // 类型筛选
    if (State.listType !== 'all') {
        result = result.filter(item => {
            if (State.listType === 'region') return item.type === 'region';
            if (State.listType === 'school') return item.type === 'school';
            if (State.listType === 'vnfest') return item.type === 'vnfest';
            return true;
        });
    }
    
    // 搜索筛选
    if (State.listQuery && State.listQuery.trim()) {
        const query = State.listQuery.toLowerCase().trim();
        result = result.filter(item => 
            (item.name || '').toLowerCase().includes(query) ||
            (item.info || '').toLowerCase().includes(query) ||
            (item.school || '').toLowerCase().includes(query)
        );
    }
    
    // 排序
    const sortStrategies = {
        default: (a, b) => {
            if ((b.verified || 0) !== (a.verified || 0)) return (b.verified || 0) - (a.verified || 0);
            return String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN-u-co-pinyin');
        },
        time_desc: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        time_asc: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
        name_asc: (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN-u-co-pinyin'),
        name_desc: (a, b) => String(b.name || '').localeCompare(String(a.name || ''), 'zh-CN-u-co-pinyin'),
        type_asc: (a, b) => {
            const typeA = Utils.groupTypeText(a.type);
            const typeB = Utils.groupTypeText(b.type);
            return typeA.localeCompare(typeB, 'zh-CN-u-co-pinyin');
        },
        type_desc: (a, b) => {
            const typeA = Utils.groupTypeText(a.type);
            const typeB = Utils.groupTypeText(b.type);
            return typeB.localeCompare(typeA, 'zh-CN-u-co-pinyin');
        }
    };
    
    result.sort(sortStrategies[State.listSort] || sortStrategies.default);
    return result;
}

function renderGroupList(rows) {
  const listEl = document.getElementById('groupList');
  if (!listEl) return;

  if (!rows.length) {
    listEl.innerHTML = '<div class="empty-text">没有找到相关同好会</div>';
    return;
  }

  listEl.innerHTML = rows.map((item) => {
    const name = Utils.escapeHTML(item.name || '未命名组织');
    const rawText = Utils.escapeHTML(item.raw_text || item.name || '');
    const detectedUrl = Utils.extractUrl(item);
    const rawInfo = detectedUrl || item.info || '';
    const infoText = rawInfo || '无联系方式';
    const info = Utils.escapeHTML(infoText);
    const type = Utils.escapeHTML(Utils.groupTypeText(item.type));
    const verifyMeta = Utils.escapeHTML(item.verified ? '已登记' : '未登记') + ' · 成立时间：' + Utils.escapeHTML(Utils.formatCreatedAt(item.created_at));
    
    const clubData = encodeURIComponent(JSON.stringify({
      id: item.id,
      name: name,
      school: item.school || '',
      info: info,
      originalInfo: item.info || '',
      detectedUrl: detectedUrl,
      type: type,
      verifyMeta: verifyMeta,
      province: item.province || '',
      remark: item.remark || '暂无介绍'
    }));
    
    return `
        <article class="group-item" data-club='${clubData}'>
          <div class="group-top">
            <h3 class="group-name" title="${rawText}">${name}</h3>
            <span class="group-chip">${type}</span>
          </div>
          <div class="group-info-row">
            <p class="group-info" data-club='${clubData}'>${info}</p>
            <button class="copy-btn" data-club='${clubData}' type="button">查看详情</button>
          </div>
          <p class="group-meta">${verifyMeta}</p>
        </article>
    `;
  }).join('');

  document.querySelectorAll('.group-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-btn')) return;
      const clubData = item.getAttribute('data-club');
      if (clubData) {
        const club = JSON.parse(decodeURIComponent(clubData));
        if (adminMode) openEditPanel(club);
        else showClubDetail(club);
      }
    });
  });
  
  document.querySelectorAll('.group-info').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const clubData = el.getAttribute('data-club');
      if (clubData) showClubDetail(JSON.parse(decodeURIComponent(clubData)));
    });
  });
  
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const clubData = btn.getAttribute('data-club');
      if (clubData) showClubDetail(JSON.parse(decodeURIComponent(clubData)));
    });
  });
}

function showClubDetail(club) {
  const modal = document.getElementById('clubDetailModal');
  const title = document.getElementById('clubDetailName');
  const content = document.getElementById('clubDetailContent');
  if (!modal) return;
  
  title.textContent = club.name;
  
  const contactInfo = club.originalInfo || club.info || '';
  const detectedUrl = club.detectedUrl;
  const isLink = detectedUrl || contactInfo.startsWith('http://') || contactInfo.startsWith('https://') || contactInfo.includes('discord.gg') || contactInfo.includes('discord.com/invite');
  const contactUrl = detectedUrl || (isLink ? contactInfo : null);
  
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };
  
  const safeInfo = escapeHtml(club.info);
  const safeUrl = contactUrl ? escapeHtml(contactUrl) : '';
  
  let contactHtml = '';
  if (isLink && contactUrl) {
    contactHtml = `
      <div style="margin-bottom: 16px; padding: 12px; background: var(--md-surface-container); border-radius: 12px;">
        <strong>群聊号码</strong><br>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="font-family: monospace; font-size: 16px; color: var(--md-primary); word-break: break-all;">${safeInfo}</a>
        <div style="margin-top: 12px;">
          <button onclick="window.open('${safeUrl.replace(/'/g, "\\'")}', '_blank')" style="margin-right: 10px; padding: 6px 16px; background: var(--md-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">打开链接</button>
          <button onclick="navigator.clipboard.writeText('${safeUrl.replace(/'/g, "\\'")}')" style="padding: 6px 16px; background: var(--md-surface-container-high); color: var(--md-primary); border: 1px solid var(--md-outline); border-radius: 8px; cursor: pointer;">复制链接</button>
        </div>
      </div>
    `;
  } else {
    const safeInfoForCopy = safeInfo.replace(/'/g, "\\'");
    contactHtml = `
      <div style="margin-bottom: 16px; padding: 12px; background: var(--md-surface-container); border-radius: 12px;">
        <strong>群聊号码</strong><br>
        <span style="font-family: monospace; font-size: 16px; word-break: break-all;">${safeInfo || '无联系方式'}</span>
        ${safeInfo ? `<button onclick="navigator.clipboard.writeText('${safeInfoForCopy}')" style="margin-left: 10px; padding: 4px 12px; background: var(--md-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">复制</button>` : ''}
      </div>
    `;
  }
  
  content.innerHTML = `
    <div style="margin-bottom: 16px; padding: 12px; background: var(--md-surface-container); border-radius: 12px;">
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div style="flex: 1;"><strong>所在省份</strong><br>${escapeHtml(club.province || '未填写')}</div>
        <div style="flex: 1;"><strong>同好会类型</strong><br>${escapeHtml(club.type || '其他')}</div>
      </div>
    </div>
    ${contactHtml}
    <div style="margin-bottom: 16px; padding: 12px; background: var(--md-surface-container); border-radius: 12px;">
      <strong>${escapeHtml(club.verifyMeta || '成立时间未知')}</strong>
    </div>
    <div style="padding: 12px; background: var(--md-surface-container); border-radius: 12px;">
      <strong>介绍</strong><br>
      <div style="margin-top: 8px; line-height: 1.6;">${escapeHtml(club.remark || '暂无介绍，欢迎补充~')}</div>
    </div>
  `;
  
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  
  const closeBtn = document.getElementById('clubDetailClose');
  if (closeBtn) {
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.onclick = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };
  }
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };
}

function renderCurrentDetail() {
    // 🔥 关键：根据是否全局搜索和当前国家获取正确数据
    let sourceRows = [];
    
    if (State.globalSearchEnabled) {
        // 全局搜索模式
        if (State.currentCountry === 'japan') {
            sourceRows = State.japanRows || [];
        } else {
            sourceRows = State.bandoriRows || [];
        }
    } else {
        // 省份模式
        sourceRows = State.currentDetailRows || [];
    }
    
    // 如果数据为空，显示提示
    if (!sourceRows.length && !State.globalSearchEnabled) {
        const provinceName = State.currentDetailProvinceName || (State.currentCountry === 'japan' ? '日本' : '未选择');
        document.getElementById('selectedTitle').textContent = `${provinceName} · 同好会详情`;
        document.getElementById('selectedProvince').textContent = '0 个组织';
        document.getElementById('selectedMeta').textContent = `范围 ${provinceName} · 暂无同好会信息`;
        document.getElementById('groupList').innerHTML = '<div class="empty-text">暂无同好会信息，欢迎提交~</div>';
        return;
    }
    
    // 应用筛选和排序
    const filtered = getFilteredSortedRows(sourceRows);
    
    const schoolCount = filtered.filter(x => x.type === 'school').length;
    const regionCount = filtered.filter(x => x.type === 'region').length;
    const vnfestCount = filtered.filter(x => x.type === 'vnfest').length;
    
    let displayTitle = State.currentDetailProvinceName;
    if (displayTitle === '非地区') displayTitle = '国内同好会';
    
    if (State.globalSearchEnabled) {
        const countryName = State.currentCountry === 'japan' ? '日本' : '全国';
        document.getElementById('selectedTitle').textContent = `🔍 全局搜索 · ${countryName}同好会`;
        let metaText = `范围 全局 · 高校同好会 ${schoolCount} · 地区联合 ${regionCount}`;
        if (vnfestCount > 0) metaText += ` · 学园祭 ${vnfestCount}`;
        if (State.listQuery) {
            metaText = `搜索 "${State.listQuery}" · 找到 ${filtered.length} 个结果 · ` + metaText;
        }
        document.getElementById('selectedMeta').textContent = metaText;
    } else {
        document.getElementById('selectedTitle').textContent = `${displayTitle} · 同好会详情`;
        document.getElementById('selectedMeta').textContent = `范围 ${displayTitle} · 高校同好会 ${schoolCount} · 地区联合 ${regionCount}`;
    }
    
    document.getElementById('selectedProvince').textContent = `${filtered.length} 个组织`;
    renderGroupListWithLocation(filtered);
}

function updateSummaryUI(source, animate = true) {
  const applySummary = () => {
    const mainlandTotal = Array.from(State.provinceGroupsMap.keys()).reduce((sum, key) => key === '海外' ? sum : sum + (State.provinceGroupsMap.get(key)?.length || 0), 0);
    document.getElementById('selectedTitle').textContent = '全国Galgame同好会数据';
    document.getElementById('selectedProvince').textContent = `${mainlandTotal} 个组织`;
    document.getElementById('selectedMeta').textContent = `数据源：${source}`;
    document.getElementById('groupList').innerHTML = '<div class="empty-text">点击地图省份查看该地区同好会信息</div>';
  };

  if (animate) animateSelectedCardUpdate(applySummary);
  else applySummary();

  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value = 'all';
  State.listQuery = '';
  State.listType = 'all';
  State.listSort = 'default';
  State.currentDetailProvinceName = '';
  State.currentDetailRows = [];
  
  updateSortButtonView();
  setGlobalSearchEnabled(false, { resetToDefault: false });
  document.getElementById('overseasToggleBtn')?.classList.remove('active');
  document.getElementById('nonRegionalToggleBtn')?.classList.remove('active');
}

// 渲染列表（带地区显示）
function renderGroupListWithLocation(rows) {
    const listEl = document.getElementById('groupList');
    if (!listEl) return;
    
    if (!rows.length) {
        listEl.innerHTML = '<div class="empty-text">没有找到相关同好会</div>';
        return;
    }
    
    const isJapan = State.currentCountry === 'japan';
    
    listEl.innerHTML = rows.map((item) => {
        const name = Utils.escapeHTML(item.name || '未命名组织');
        const rawText = Utils.escapeHTML(item.raw_text || item.name || '');
        const detectedUrl = Utils.extractUrl(item);
        const infoText = detectedUrl || item.info || '';
        const info = Utils.escapeHTML(infoText);
        const type = Utils.escapeHTML(Utils.groupTypeText(item.type));
        const verifyMeta = Utils.escapeHTML(item.verified ? '已登记' : '未登记') + ' · 成立时间：' + Utils.escapeHTML(Utils.formatCreatedAt(item.created_at));
        
        // 地区显示
        let locationText = '';
        if (isJapan) {
            locationText = item.prefecture || item.province || '';
        } else {
            locationText = item.province || '';
        }
        
        const clubData = encodeURIComponent(JSON.stringify({
            id: item.id,
            name: name,
            school: item.school || '',
            info: info,
            originalInfo: item.info || '',
            detectedUrl: detectedUrl,
            type: type,
            verifyMeta: verifyMeta,
            province: locationText,
            remark: item.remark || '暂无介绍',
            country: isJapan ? 'japan' : 'china'
        }));
        
        return `
            <article class="group-item" data-club='${clubData}'>
                <div class="group-top">
                    <h3 class="group-name" title="${rawText}">${name}</h3>
                    <span class="group-chip">${type}</span>
                </div>
                ${locationText ? `<div style="font-size: 11px; color: var(--md-primary); margin-bottom: 4px;">📍 ${Utils.escapeHTML(locationText)}</div>` : ''}
                <div class="group-info-row">
                    <p class="group-info" data-club='${clubData}'>${info || '暂无联系方式'}</p>
                    <button class="copy-btn" data-club='${clubData}' type="button">查看详情</button>
                </div>
                <p class="group-meta">${verifyMeta}</p>
            </article>
        `;
    }).join('');
    
    // 绑定事件
    document.querySelectorAll('.group-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) return;
            const clubData = item.getAttribute('data-club');
            if (clubData) {
                const club = JSON.parse(decodeURIComponent(clubData));
                if (adminMode) openEditPanel(club);
                else showClubDetail(club);
            }
        });
    });
    
    document.querySelectorAll('.group-info').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const clubData = el.getAttribute('data-club');
            if (clubData) showClubDetail(JSON.parse(decodeURIComponent(clubData)));
        });
    });
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clubData = btn.getAttribute('data-club');
            if (clubData) showClubDetail(JSON.parse(decodeURIComponent(clubData)));
        });
    });
}

function showProvinceDetails(provinceName) {
    console.log('点击省份:', provinceName, '当前国家:', State.currentCountry);
    
    const key = Utils.normalizeProvinceName(provinceName);
    State.currentDetailProvinceName = provinceName;
    
    // 🔥 关键：根据当前国家获取正确的数据
    if (State.currentCountry === 'japan') {
        State.currentDetailRows = State.japanGroupsMap.get(provinceName) || [];
    } else {
        if (provinceName === '国内同好会') {
            State.currentDetailRows = State.provinceGroupsMap.get('__non_regional__') || [];
        } else if (provinceName === '海外') {
            State.currentDetailRows = State.provinceGroupsMap.get('海外') || [];
        } else {
            State.currentDetailRows = State.provinceGroupsMap.get(key) || [];
        }
    }
    
    console.log('获取到数据:', State.currentDetailRows.length, '条');
    
    // 关闭全局搜索
    if (State.globalSearchEnabled) {
        State.globalSearchEnabled = false;
        const btn = document.getElementById('globalSearchBtn');
        if (btn) btn.classList.remove('active');
    }
    
    // 🔥 使用动画更新右侧面板
    animateSelectedCardUpdate(() => {
        renderCurrentDetail();
    });
    
    // 更新按钮状态
    const overseasBtn = document.getElementById('overseasToggleBtn');
    const nonRegionalBtn = document.getElementById('nonRegionalToggleBtn');
    if (overseasBtn) overseasBtn.classList.toggle('active', key === '海外');
    if (nonRegionalBtn) nonRegionalBtn.classList.toggle('active', provinceName === '国内同好会');
}

// 右侧面板更新动画
function animateSelectedCardUpdate(updateFn) {
    const card = document.getElementById('selectedCard');
    if (!card) return updateFn();

    State.selectedCardAnimToken++;
    const myToken = State.selectedCardAnimToken;

    // 记录当前高度
    const startHeight = card.getBoundingClientRect().height;
    card.style.height = `${startHeight}px`;
    card.classList.add('switching');

    // 执行更新
    updateFn();

    // 获取更新后的高度
    card.style.height = 'auto';
    const targetHeight = card.getBoundingClientRect().height;
    
    // 重置回起始高度
    card.style.height = `${startHeight}px`;
    void card.offsetHeight; // 强制重绘

    // 动画到目标高度
    requestAnimationFrame(() => {
        if (myToken !== State.selectedCardAnimToken) return;
        card.style.height = `${targetHeight}px`;
    });

    // 动画结束后清理
    const clear = () => {
        if (myToken !== State.selectedCardAnimToken) return;
        card.style.height = '';
        card.classList.remove('switching');
        card.removeEventListener('transitionend', clear);
    };
    card.addEventListener('transitionend', clear);
    setTimeout(clear, 560);
}

function hideMapBubble() {
  document.getElementById('badgeBubble')?.classList.remove('open');
  State.activeBubbleState = null;
}

function placeMapBubble(anchorX, anchorY) {
  if (!State.mapViewState) return;
  const bubble = document.getElementById('badgeBubble');
  if (!bubble) return;

  const transform = d3.zoomTransform(State.mapViewState.svg.node());
  bubble.style.left = `${transform.x + anchorX * transform.k}px`;
  bubble.style.top = `${transform.y + anchorY * transform.k}px`;
}

// 显示中国地图省份气泡（带动画）
function showMapBubbleByProvince(provinceName, anchorX, anchorY) {
    const bubble = document.getElementById('badgeBubble');
    if (!bubble) return;

    const key = Utils.normalizeProvinceName(provinceName);
    const rows = State.provinceGroupsMap.get(key) || [];
    if (!rows.length) return hideMapBubble();

    State.bubbleAnimToken++;
    const myToken = State.bubbleAnimToken;
    const isCurrentlyOpen = bubble.classList.contains('open');
    let startRect;

    // 如果当前是关闭状态，先瞬间定位（避免闪现）
    if (!isCurrentlyOpen) bubble.classList.add('instant-place');
    
    // 如果当前是打开状态，记录当前尺寸用于动画
    if (isCurrentlyOpen) {
        startRect = bubble.getBoundingClientRect();
        bubble.style.width = `${startRect.width}px`;
        bubble.style.height = `${startRect.height}px`;
    }

    // 更新气泡内容
    bubble.innerHTML = `
        <div class="map-bubble-scroll">
            <h3 class="map-bubble-title">${Utils.escapeHTML(provinceName)} · ${rows.length} 个组织</h3>
            ${rows.slice(0, 12).map(item => `
                <article class="map-bubble-item" data-copy="${encodeURIComponent(String(item.info || ''))}" title="点击复制联系方式">
                    <div class="bubble-name-wrap"><span class="bubble-name">${Utils.escapeHTML(item.name || '未命名')}</span></div>
                    <div class="bubble-id">${Utils.escapeHTML(String(item.info || '无联系方式'))}</div>
                </article>
            `).join('')}
            ${rows.length > 12 ? `<div class="map-bubble-more" style="margin-top: 8px; font-size: 12px; color: var(--md-primary); text-align: center;">还有 ${rows.length - 12} 个组织，点击地图查看全部</div>` : ''}
        </div>
    `;

    State.activeBubbleState = { provinceName, anchorX, anchorY, isChina: true };
    placeMapBubble(anchorX, anchorY);

    // 重置为自动尺寸
    bubble.style.width = 'auto';
    bubble.style.height = 'auto';

    // 如果之前是打开状态，执行平滑尺寸过渡动画
    if (isCurrentlyOpen) {
        const targetRect = bubble.getBoundingClientRect();
        bubble.style.width = `${startRect.width}px`;
        bubble.style.height = `${startRect.height}px`;
        void bubble.offsetHeight; // 强制重绘

        requestAnimationFrame(() => {
            if (myToken !== State.bubbleAnimToken) return;
            bubble.style.width = `${targetRect.width}px`;
            bubble.style.height = `${targetRect.height}px`;
        });

        setTimeout(() => {
            if (myToken === State.bubbleAnimToken) {
                bubble.style.width = '';
                bubble.style.height = '';
            }
        }, 420);
    }

    // 显示气泡
    requestAnimationFrame(() => {
        bubble.classList.add('open');
        // 处理长名称滚动
        bubble.querySelectorAll('.bubble-name').forEach(el => {
            el.classList.toggle('marquee', el.scrollWidth > el.parentElement.clientWidth + 4);
        });
        if (!isCurrentlyOpen) {
            void bubble.offsetHeight;
            bubble.classList.remove('instant-place');
        }
    });
}

const MapUtils = {
  colorByCount: (count, maxCount) => {
    if (!count) return '#ffdce9';
    const ratio = Math.max(0, Math.min(1, count / Math.max(1, maxCount)));
    return ratio > 0.75 ? '#c2185b' : ratio > 0.5 ? '#d94f84' : ratio > 0.25 ? '#ec78a5' : '#f59cc0';
  },
  getBadgeOffset: (id) => ({ sh: { dx: 16, dy: -10 }, hk: { dx: 20, dy: -12 }, mc: { dx: -18, dy: 10 }, hb: { dx: 0, dy: 20 }, im: { dx: 0, dy: 0 } }[id] || { dx: 0, dy: 0 }),
  ensurePointInsideProvince: (pathNode, box, preferred) => {
    const svg = pathNode?.ownerSVGElement;
    if (!pathNode || !svg || typeof pathNode.isPointInFill !== 'function') return preferred;

    const test = (x, y) => {
      const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
      return pathNode.isPointInFill(pt);
    };

    const candidates = [
      [preferred.cx, preferred.cy],
      [box.x + box.width * 0.5, box.y + box.height * 0.62],
      [box.x + box.width * 0.35, box.y + box.height * 0.62],
      [box.x + box.width * 0.65, box.y + box.height * 0.62]
    ];

    for (let [x, y] of candidates) if (test(x, y)) return { cx: x, cy: y };
    return preferred;
  }
};

function renderChinaMap() {
  const mapEl = document.getElementById('map');
  const svgEl = document.getElementById('mapSvg');
  if (!mapEl || !svgEl) return;

  const w = mapEl.clientWidth || window.innerWidth;
  const h = mapEl.clientHeight || window.innerHeight;
  
  svgEl.innerHTML = '';

  const fitScale = Math.min(w / CONFIG.BASE_WIDTH, h / CONFIG.BASE_HEIGHT) * 0.95;
  const offsetX = (w - CONFIG.BASE_WIDTH * fitScale) / 2;
  const offsetY = (h - CONFIG.BASE_HEIGHT * fitScale) / 2;

  china().width(w).height(h).scale(1).language('cn')
    .colorDefault('#ffdce9').colorLake('#ffffff')
    .draw('#mapSvg');

  setTimeout(() => {
    const svg = d3.select('#mapSvg');
    const g = svg.select('g');
    if (g.empty()) {
      console.error('❌ 地图绘制失败');
      return;
    }

    const idToName = {
      'hlj': '黑龙江', 'jl': '吉林', 'ln': '辽宁', 'hb': '河北', 'sd': '山东',
      'js': '江苏', 'zj': '浙江', 'ah': '安徽', 'hn': '河南', 'sx': '山西',
      'snx': '陕西', 'gs': '甘肃', 'hub': '湖北', 'jx': '江西', 'hun': '湖南',
      'gz': '贵州', 'sc': '四川', 'yn': '云南', 'qh': '青海', 'han': '海南',
      'cq': '重庆', 'tj': '天津', 'bj': '北京', 'nx': '宁夏', 'im': '内蒙古',
      'gx': '广西', 'xj': '新疆', 'tb': '西藏', 'sh': '上海', 'fj': '福建',
      'gd': '广东', 'hk': '香港', 'mc': '澳门', 'tw': '台湾'
    };

    const allCounts = Array.from(State.provinceGroupsMap.entries())
      .filter(([k]) => k !== '海外').map(([, arr]) => arr.length);
    const maxCount = allCounts.length ? Math.max(...allCounts) : 1;

    // 更新颜色
    g.selectAll('.province').each(function() {
      const provinceName = idToName[this.id];
      const count = State.provinceGroupsMap.get(provinceName)?.length || 0;
      d3.select(this).style('fill', MapUtils.colorByCount(count, maxCount));
    });

    g.selectAll('.count-layer').remove();
    const badgeLayer = g.append('g').attr('class', 'count-layer');

    // 添加徽章 - 恢复原来的位置计算
    g.selectAll('.province').each(function() {
      const provinceName = idToName[this.id];
      const count = State.provinceGroupsMap.get(provinceName)?.length || 0;
      if (!count) return;

      const box = this.getBBox();
      if (!box.width || !box.height) return;

      // 恢复原来的位置计算
      const preferredAnchor = { 
        cx: box.x + box.width / (this.id === 'im' ? 2.8 : 2), 
        cy: box.y + box.height / (this.id === 'im' ? 1.5 : 2) 
      };
      const insideAnchor = MapUtils.ensurePointInsideProvince(this, box, preferredAnchor);
      const offset = MapUtils.getBadgeOffset(this.id);
      
      const cx = Math.max(14, Math.min(CONFIG.BASE_WIDTH - 14, insideAnchor.cx + offset.dx));
      const cy = Math.max(14, Math.min(CONFIG.BASE_HEIGHT - 14, insideAnchor.cy + offset.dy));

      const badge = badgeLayer.append('g')
        .attr('class', 'count-badge')
        .attr('transform', `translate(${cx},${cy})`);
        
      badge.append('circle')
        .attr('r', count > 99 ? 13 : 11)
        .attr('fill', 'var(--md-primary)')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);
        
      badge.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', count > 99 ? '10px' : '12px')
        .attr('fill', '#ffffff')
        .attr('font-weight', 'bold')
        .text(count > 99 ? '99+' : count);

      // 徽章点击事件
      badge.on('click', function(event) {
        event.stopPropagation();
        const shouldShowBubble = State.invertCtrlBubble ? !!event.ctrlKey : !event.ctrlKey;
        
        if (!shouldShowBubble) {
          setGlobalSearchEnabled(false);
          State.selectedProvinceKey = provinceName;
          g.selectAll('.province').classed('selected', false);
          g.selectAll('.province').classed('selected', function() {
            return idToName[this.id] === provinceName;
          });
          showProvinceDetails(provinceName);
          hideMapBubble();
        } else {
          showMapBubbleByProvince(provinceName, cx, cy);
        }
      });
    });

    const zoom = d3.zoom().scaleExtent([fitScale, fitScale * 12])
      .on('zoom', (e) => { g.attr('transform', e.transform); });

    svg.call(zoom).on('dblclick.zoom', null);
    svg.call(zoom.transform, d3.zoomIdentity.translate(offsetX, offsetY).scale(fitScale));

    if (State.selectedProvinceKey) {
      g.selectAll('.province').classed('selected', function() {
        return idToName[this.id] === State.selectedProvinceKey;
      });
    }

    State.mapViewState = { svg, g, zoom, width: w, height: h, 
      minScale: fitScale, maxScale: fitScale * 12, 
      baseScale: fitScale, baseTranslate: [offsetX, offsetY] };
    
    console.log('✅ 中国地图渲染完成');
  }, 50);
}

function renderJapanMap() {
  const mapEl = document.getElementById('map');
  const svgEl = document.getElementById('mapSvg');
  if (!mapEl || !svgEl) return;

  const w = mapEl.clientWidth || window.innerWidth;
  const h = mapEl.clientHeight || window.innerHeight;
  svgEl.innerHTML = '';

  const japanWidth = Math.max(w, 1200);
  const japanHeight = Math.max(h, 1100);

const japanNameMap = {
    'JP-01': '北海道',      // 保持不变（汉字相同）
    'JP-02': '青森県',      // 青森县 → 青森県
    'JP-03': '岩手県',      // 岩手县 → 岩手県
    'JP-04': '宮城県',      // 宫城县 → 宮城県
    'JP-05': '秋田県',      // 秋田县 → 秋田県
    'JP-06': '山形県',      // 山形县 → 山形県
    'JP-07': '福島県',      // 福岛县 → 福島県
    'JP-08': '茨城県',      // 茨城县 → 茨城県
    'JP-09': '栃木県',      // 栃木县 → 栃木県
    'JP-10': '群馬県',      // 群马县 → 群馬県
    'JP-11': '埼玉県',      // 埼玉县 → 埼玉県
    'JP-12': '千葉県',      // 千叶县 → 千葉県
    'JP-13': '東京都',      // 东京都 → 東京都
    'JP-14': '神奈川県',    // 神奈川县 → 神奈川県
    'JP-15': '新潟県',      // 新潟县 → 新潟県
    'JP-16': '富山県',      // 富山县 → 富山県
    'JP-17': '石川県',      // 石川县 → 石川県
    'JP-18': '福井県',      // 福井县 → 福井県
    'JP-19': '山梨県',      // 山梨县 → 山梨県
    'JP-20': '長野県',      // 长野县 → 長野県
    'JP-21': '岐阜県',      // 岐阜县 → 岐阜県
    'JP-22': '静岡県',      // 静冈县 → 静岡県
    'JP-23': '愛知県',      // 爱知县 → 愛知県
    'JP-24': '三重県',      // 三重县 → 三重県
    'JP-25': '滋賀県',      // 滋贺县 → 滋賀県
    'JP-26': '京都府',      // 京都府 → 京都府
    'JP-27': '大阪府',      // 大阪府 → 大阪府
    'JP-28': '兵庫県',      // 兵库县 → 兵庫県
    'JP-29': '奈良県',      // 奈良县 → 奈良県
    'JP-30': '和歌山県',    // 和歌山县 → 和歌山県
    'JP-31': '鳥取県',      // 鸟取县 → 鳥取県
    'JP-32': '島根県',      // 岛根县 → 島根県
    'JP-33': '岡山県',      // 冈山县 → 岡山県
    'JP-34': '広島県',      // 广岛县 → 広島県
    'JP-35': '山口県',      // 山口县 → 山口県
    'JP-36': '徳島県',      // 德岛县 → 徳島県
    'JP-37': '香川県',      // 香川县 → 香川県
    'JP-38': '愛媛県',      // 爱媛县 → 愛媛県
    'JP-39': '高知県',      // 高知县 → 高知県
    'JP-40': '福岡県',      // 福冈县 → 福岡県
    'JP-41': '佐賀県',      // 佐贺县 → 佐賀県
    'JP-42': '長崎県',      // 长崎县 → 長崎県
    'JP-43': '熊本県',      // 熊本县 → 熊本県
    'JP-44': '大分県',      // 大分县 → 大分県
    'JP-45': '宮崎県',      // 宫崎县 → 宮崎県
    'JP-46': '鹿児島県',    // 鹿儿岛县 → 鹿児島県
    'JP-47': '沖縄県'       // 冲绳县 → 沖縄県
};

  japan().width(japanWidth).height(japanHeight).scale(1).language('cn')
    .colorDefault('#ffdce9')
    .colorLake('#ffffff')
    .draw('#mapSvg');

  setTimeout(() => {
    const svg = d3.select('#mapSvg');
    const g = svg.select('g');
    
    if (g.empty()) {
      console.error('❌ 日本地图绘制失败');
      return;
    }

    const allCounts = Array.from(State.japanGroupsMap.values()).map(arr => arr.length);
    const maxCount = allCounts.length ? Math.max(...allCounts) : 1;
    const BASE_SCREEN_RADIUS = 8;

    g.selectAll('.province').each(function(d) {
      const chineseName = japanNameMap[d.id] || d.name;
      const count = State.japanGroupsMap.get(chineseName)?.length || 0;
      d3.select(this)
        .style('fill', MapUtils.colorByCount(count, maxCount))
        .style('cursor', 'pointer');
    });

    g.selectAll('.count-layer').remove();
    const badgeLayer = g.append('g').attr('class', 'count-layer');

    g.selectAll('.province').each(function(d) {
      const chineseName = japanNameMap[d.id] || d.name;
      const count = State.japanGroupsMap.get(chineseName)?.length || 0;
      if (!count) return;

      const box = this.getBBox();
      if (!box.width || !box.height) return;

      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;

      const currentTransform = d3.zoomTransform(svg.node());
      const currentScale = currentTransform.k || 1;

      const radius = BASE_SCREEN_RADIUS / currentScale;
      const finalRadius = Math.max(6, Math.min(25, radius));
      const finalFontSize = Math.max(3, Math.min(18, radius * 0.7));

      const badge = badgeLayer.append('g')
        .attr('class', 'count-badge')
        .attr('data-count', count)
        .attr('data-name', chineseName)
        .attr('data-cx', cx)
        .attr('data-cy', cy)
        .attr('transform', `translate(${cx},${cy})`);

      badge.append('circle')
        .attr('r', finalRadius)
        .attr('fill', 'var(--md-primary)')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);

      badge.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', `${finalFontSize}px`)
        .attr('fill', '#ffffff')
        .attr('font-weight', 'bold')
        .text(count > 99 ? '99+' : count);

      // 小球点击：显示气泡（二级菜单）
      badge.on('click', (event) => {
        event.stopPropagation();
        const shouldShowBubble = State.invertCtrlBubble ? !!event.ctrlKey : !event.ctrlKey;
        
        if (!shouldShowBubble) {
          showJapanProvinceDetails(chineseName);
          hideMapBubble();
        } else {
          showJapanMapBubble(chineseName, cx, cy);
        }
      });
    });

    // 省份区域点击：显示右侧列表
    g.selectAll('.province').each(function(d) {
      const provinceElement = this;
      const chineseName = japanNameMap[d.id] || d.name;
      
      provinceElement.onclick = null;
    });

    const fitScale = Math.min(w / japanWidth, h / japanHeight) * 1.25;
    const offsetX = (w - japanWidth * fitScale) / 2 + japanWidth * fitScale * 0.14;
    const offsetY = (h - japanHeight * fitScale) / 2 + japanHeight * fitScale * 0.12;

    const zoom = d3.zoom().scaleExtent([fitScale * 0.6, fitScale * 20])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        const currentScale = event.transform.k;
        
        badgeLayer.selectAll('.count-badge').each(function() {
          const badge = d3.select(this);
          const count = parseInt(badge.attr('data-count')) || 0;
          const radius = BASE_SCREEN_RADIUS / currentScale;
          const finalRadius = Math.max(6, Math.min(25, radius));
          const finalFontSize = Math.max(2, Math.min(18, radius * 0.7));
          badge.select('circle').attr('r', finalRadius);
          badge.select('text')
            .attr('font-size', `${finalFontSize}px`)
            .text(count > 99 ? '99+' : count);
        });
        
        if (State.activeBubbleState && State.activeBubbleState.isJapan) {
          placeMapBubble(State.activeBubbleState.anchorX, State.activeBubbleState.anchorY);
        }
      });

    svg.call(zoom).on('dblclick.zoom', null);
    svg.call(zoom.transform, d3.zoomIdentity.translate(offsetX, offsetY).scale(fitScale));

    setTimeout(() => {
      const initialTransform = d3.zoomTransform(svg.node());
      badgeLayer.selectAll('.count-badge').each(function() {
        const badge = d3.select(this);
        const count = parseInt(badge.attr('data-count')) || 0;
        const radius = BASE_SCREEN_RADIUS / initialTransform.k;
        const finalRadius = Math.max(6, Math.min(25, radius));
        const finalFontSize = Math.max(2, Math.min(18, radius * 0.7));
        badge.select('circle').attr('r', finalRadius);
        badge.select('text')
          .attr('font-size', `${finalFontSize}px`)
          .text(count > 99 ? '99+' : count);
      });
    }, 50);

    State.mapViewState = { svg, g, zoom, badgeLayer, width: w, height: h, minScale: fitScale * 0.6, maxScale: fitScale * 20, baseScale: fitScale, baseTranslate: [offsetX, offsetY] };
    
    console.log('✅ 日本地图渲染完成，省份数量:', g.selectAll('.province').size());
    bindMapTooltip();
  }, 50);
  
}

// 显示日本县详情（已经有动画，保持原样）
function showJapanProvinceDetails(prefectureName) {
    const rows = State.japanGroupsMap.get(prefectureName) || [];
    State.currentDetailProvinceName = prefectureName;
    
    // 已有动画，保持不变
    animateSelectedCardUpdate(() => {
        State.currentDetailRows = rows;
        document.getElementById('selectedTitle').textContent = `${prefectureName} · 同好会详情`;
        document.getElementById('selectedProvince').textContent = `${rows.length} 个组织`;
        document.getElementById('selectedMeta').textContent = `日本 · ${prefectureName}`;
        if (rows.length) {
            renderGroupList(getFilteredSortedRows(rows));
        } else {
            document.getElementById('groupList').innerHTML = '<div class="empty-text">暂无同好会信息，欢迎提交~</div>';
        }
    });
}

// 显示日本地图的省份气泡（二级菜单）
function showJapanMapBubble(provinceName, anchorX, anchorY) {
  const bubble = document.getElementById('badgeBubble');
  if (!bubble) return;

  const rows = State.japanGroupsMap.get(provinceName) || [];
  if (!rows.length) return hideMapBubble();

  State.bubbleAnimToken++;
  const myToken = State.bubbleAnimToken;
  const isCurrentlyOpen = bubble.classList.contains('open');
  let startRect;

  if (!isCurrentlyOpen) bubble.classList.add('instant-place');
  if (isCurrentlyOpen) {
    startRect = bubble.getBoundingClientRect();
    bubble.style.width = `${startRect.width}px`;
    bubble.style.height = `${startRect.height}px`;
  }

  bubble.innerHTML = `
    <div class="map-bubble-scroll">
      <h3 class="map-bubble-title">${Utils.escapeHTML(provinceName)} · ${rows.length} 个组织</h3>
      ${rows.slice(0, 12).map(item => `
        <article class="map-bubble-item" data-club='${encodeURIComponent(JSON.stringify({
          id: item.id,
          name: item.name,
          info: item.info,
          type: item.type,
          province: provinceName,
          prefecture: item.prefecture || provinceName,
          remark: item.remark || '暂无介绍',
          verified: item.verified
        }))}'>
          <div class="bubble-name-wrap"><span class="bubble-name">${Utils.escapeHTML(item.name || '未命名')}</span></div>
          <div class="bubble-id">${Utils.escapeHTML(String(item.info || '无联系方式'))}</div>
        </article>
      `).join('')}
      ${rows.length > 12 ? `<div class="map-bubble-more" style="margin-top: 8px; font-size: 12px; color: var(--md-primary); text-align: center;">还有 ${rows.length - 12} 个组织，点击地图查看全部</div>` : ''}
    </div>
  `;

  State.activeBubbleState = { provinceName, anchorX, anchorY, isJapan: true };
  placeMapBubble(anchorX, anchorY);

  bubble.style.width = 'auto';
  bubble.style.height = 'auto';

  if (isCurrentlyOpen) {
    const targetRect = bubble.getBoundingClientRect();
    bubble.style.width = `${startRect.width}px`;
    bubble.style.height = `${startRect.height}px`;
    void bubble.offsetHeight;

    requestAnimationFrame(() => {
      if (myToken !== State.bubbleAnimToken) return;
      bubble.style.width = `${targetRect.width}px`;
      bubble.style.height = `${targetRect.height}px`;
    });

    setTimeout(() => {
      if (myToken === State.bubbleAnimToken) {
        bubble.style.width = '';
        bubble.style.height = '';
      }
    }, 420);
  }

  requestAnimationFrame(() => {
    bubble.classList.add('open');
    bubble.querySelectorAll('.bubble-name').forEach(el => {
      el.classList.toggle('marquee', el.scrollWidth > el.parentElement.clientWidth + 4);
    });
    if (!isCurrentlyOpen) {
      void bubble.offsetHeight;
      bubble.classList.remove('instant-place');
    }
  });

  setTimeout(() => {
    bubble.querySelectorAll('.map-bubble-item').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const clubData = el.getAttribute('data-club');
        if (clubData) {
          const club = JSON.parse(decodeURIComponent(clubData));
          showClubDetail(club);
          hideMapBubble();
        }
      };
    });
  }, 50);
}

function switchToChinaMap() {
    if (State.currentCountry === 'china') return;
    State.currentCountry = 'china';
    document.getElementById('chinaToggleBtn')?.classList.add('active');
    document.getElementById('japanToggleBtn')?.classList.remove('active');
    const svgEl = document.getElementById('mapSvg');
    if (svgEl) svgEl.innerHTML = '';
    setTimeout(() => {
        renderChinaMap();
        updateSummaryUI(State.currentDataSource);
        
        // 添加这部分：重置搜索状态
        State.globalSearchEnabled = false;
        State.listQuery = '';
        State.listType = 'all';
        State.listSort = 'default';
        if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
        if (document.getElementById('typeFilter')) document.getElementById('typeFilter').value = 'all';
        updateSortButtonView();
        const globalBtn = document.getElementById('globalSearchBtn');
        if (globalBtn) globalBtn.classList.remove('active');
        renderCurrentDetail();
        bindMapTooltip();
        // 结束
    }, 100);
}

// 切换到日本地图（数据已预加载）
function switchToJapanMap() {
    if (State.currentCountry === 'japan') return;
    
    console.log('切换到日本地图');
    State.currentCountry = 'japan';
    
    document.getElementById('japanToggleBtn')?.classList.add('active');
    document.getElementById('chinaToggleBtn')?.classList.remove('active');
    
    // 重置详情数据（但不清空已加载的数据）
    State.currentDetailProvinceName = '';
    State.currentDetailRows = [];
    State.globalSearchEnabled = false;
    State.listQuery = '';
    State.listType = 'all';
    
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('typeFilter')) document.getElementById('typeFilter').value = 'all';
    
    const globalBtn = document.getElementById('globalSearchBtn');
    if (globalBtn) globalBtn.classList.remove('active');
    
    const svgEl = document.getElementById('mapSvg');
    if (svgEl) svgEl.innerHTML = '';
    
    // 直接渲染，不需要再加载数据（数据已在 init 时加载）
    setTimeout(() => {
        renderJapanMap();
        updateSummaryUI('日本同好会数据');
        renderCurrentDetail();
    }, 100);
}


async function loadJapanData() {
  try {
    const resp = await fetch('./data/clubs_japan.json', { cache: 'no-store' });
    if (resp.ok) {
      const json = await resp.json();
      if (json?.data && Array.isArray(json.data)) {
        State.japanRows = json.data;
        State.japanGroupsMap = new Map();
        State.japanRows.forEach(item => {
          const prefecture = item.prefecture || item.province;
          if (!prefecture) return;
          if (!State.japanGroupsMap.has(prefecture)) {
            State.japanGroupsMap.set(prefecture, []);
          }
          State.japanGroupsMap.get(prefecture).push(item);
        });
        console.log('✅ 日本数据加载成功，共', State.japanRows.length, '条');
        return true;
      }
    }
    useMockJapanData();
  } catch (e) {
    console.log('日本数据加载失败，使用模拟数据:', e);
    useMockJapanData();
  }
  return false;
}

function useMockJapanData() {
  State.japanRows = [
    { id: 1, name: "东京大学视觉小说研究会", prefecture: "东京都", info: "https://discord.gg/example", type: "school", created_at: "2026-05-07" },
    { id: 2, name: "京都大学Galgame同好会", prefecture: "京都府", info: "123456789", type: "school", created_at: "2026-05-07" },
    { id: 3, name: "大阪大学动漫研究社", prefecture: "大阪府", info: "987654321", type: "school", created_at: "2026-05-07" },
    { id: 4, name: "北海道大学视觉小说部", prefecture: "北海道", info: "111222333", type: "school", created_at: "2026-05-07" },
    { id: 5, name: "名古屋大学Galgame部", prefecture: "爱知县", info: "444555666", type: "school", created_at: "2026-05-07" }
  ];
  State.japanGroupsMap = new Map();
  State.japanRows.forEach(item => {
    const prefecture = item.prefecture;
    if (!prefecture) return;
    if (!State.japanGroupsMap.has(prefecture)) State.japanGroupsMap.set(prefecture, []);
    State.japanGroupsMap.get(prefecture).push(item);
  });
  console.log('📝 使用日本模拟数据，共', State.japanRows.length, '条');
}

async function reloadBandoriData() {
  let rows = [], source = 'none';
  
  try {
    const resp = await fetch('./data/clubs.json', { cache: 'no-store' });
    if (resp.ok) {
      const json = await resp.json();
      if (json?.data && Array.isArray(json.data)) {
        rows = json.data;
        source = '本地JSON';
        console.log('✅ 从本地JSON加载数据成功');
      }
    }
  } catch (e) {
    console.log('数据加载失败:', e);
  }

  State.bandoriRows = rows;
  State.currentDataSource = source;
  State.provinceGroupsMap = new Map();
  
  rows.forEach(item => {
    const key = item.type === 'non-regional' ? '__non_regional__' : Utils.normalizeProvinceName(item.province);
    if (!key) return;
    if (!State.provinceGroupsMap.has(key)) State.provinceGroupsMap.set(key, []);
    State.provinceGroupsMap.get(key).push(item);
  });

  updateSummaryUI(source, false);
  renderChinaMap();
}

function exportData() {
  const dataStr = JSON.stringify(State.bandoriRows, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `galgame_clubs_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert('📁 数据已导出！');
}

// ==========================================
// 事件绑定
// ==========================================
function bindAllStaticEvents() {
  document.addEventListener('click', async (e) => {
    const linkTrigger = e.target.closest('.copy-number[data-href]');
    if (linkTrigger) {
      const href = linkTrigger.getAttribute('data-href');
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    const trigger = e.target.closest('.copy-btn, .copy-number, .map-bubble-item');
    if (!trigger) return;
    const text = decodeURIComponent(trigger.getAttribute('data-copy') || '');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const targetEl = trigger.querySelector('.bubble-id') || trigger;
      const oldText = targetEl.textContent;
      targetEl.textContent = '已复制';
      setTimeout(() => targetEl.textContent = oldText, 900);
    } catch (err) {}
  });

  document.getElementById('searchInput')?.addEventListener('input', (e) => { 
    State.listQuery = e.target.value.trim().toLowerCase(); 
    renderCurrentDetail(); 
  });
  
  document.getElementById('typeFilter')?.addEventListener('change', (e) => { 
    State.listType = e.target.value || 'all'; 
    renderCurrentDetail(); 
  });
  
  document.getElementById('globalSearchBtn')?.addEventListener('click', () => { 
    setGlobalSearchEnabled(!State.globalSearchEnabled, { resetToDefault: true }); 
    renderCurrentDetail(); 
  });
  
  document.getElementById('sortBar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.sort-btn');
    if (btn) { 
      State.listSort = btn.getAttribute('data-sort') || 'default'; 
      updateSortButtonView(); 
      renderCurrentDetail(); 
    }
  });

  const stepScale = (factor) => {
    if (!State.mapViewState) return;
    const { svg, zoom, minScale, maxScale, width, height } = State.mapViewState;
    const currentTransform = d3.zoomTransform(svg.node());
    const nextScale = Math.max(minScale, Math.min(maxScale, currentTransform.k * factor));
    const center = [width / 2, height / 2];
    const nextTransform = d3.zoomIdentity
      .translate(currentTransform.x, currentTransform.y)
      .scale(currentTransform.k)
      .translate(center[0], center[1])
      .scale(nextScale / currentTransform.k)
      .translate(-center[0], -center[1]);
    svg.call(zoom.transform, nextTransform);
  };

  document.getElementById('zoomInBtn')?.addEventListener('click', () => stepScale(1.2));
  document.getElementById('zoomOutBtn')?.addEventListener('click', () => stepScale(1 / 1.2));
  
  const resetViewBtn = document.getElementById('resetViewBtn');
  if (resetViewBtn) {
      resetViewBtn.onclick = function() {
          console.log('桌面端重置按钮被点击');
          
          State.resetClickBurstCount++;
          clearTimeout(State.resetClickBurstTimer);
          State.resetClickBurstTimer = setTimeout(function() { 
              State.resetClickBurstCount = 0; 
          }, 1400);
          
          if (State.resetClickBurstCount >= 6) {
              State.developerModeEnabled = !State.developerModeEnabled;
              State.resetClickBurstCount = 0;
              const btn = document.getElementById('resetViewBtn');
              if(btn) {
                  btn.textContent = State.developerModeEnabled ? '重置（开发者）' : '重置';
                  btn.title = State.developerModeEnabled ? '允许右键' : '禁止右键';
              }
              const floatingAdminBtn = document.getElementById('floatingAdminBtn');
              if (State.developerModeEnabled) {
                  document.body.classList.add('developer-mode');
                  if (floatingAdminBtn) floatingAdminBtn.style.display = 'flex';
                  console.log('🔓 开发者模式已开启');
                  if (Utils.isMobileViewport()) {
                      showToast('开发者模式已开启！\n管理员按钮已出现在右下角', 3000);
                  } else {
                      alert('开发者模式已开启！\n👑 管理员按钮已出现在右下角');
                  }
              } else {
                  document.body.classList.remove('developer-mode');
                  if (floatingAdminBtn) floatingAdminBtn.style.display = 'none';
                  if (adminMode) toggleAdminMode();
                  console.log('🔒 开发者模式已关闭');
                  if (Utils.isMobileViewport()) {
                      showToast('开发者模式已关闭', 1500);
                  }
              }
          }
          
          if (State.mapViewState) {
              const { svg, zoom, baseScale, baseTranslate } = State.mapViewState;
              svg.call(zoom.transform, d3.zoomIdentity.translate(baseTranslate[0], baseTranslate[1]).scale(baseScale));
          }
      };
      console.log('✅ 桌面端重置按钮绑定成功');
  }

  document.getElementById('overseasToggleBtn')?.addEventListener('click', () => {
    setGlobalSearchEnabled(false);
    State.selectedProvinceKey = '海外';
    showProvinceDetails('海外');
    hideMapBubble();
    State.mapViewState?.g.selectAll('.province').classed('selected', false);
  });

  document.getElementById('nonRegionalToggleBtn')?.addEventListener('click', () => {
    setGlobalSearchEnabled(false);
    const allDomesticRows = State.bandoriRows.filter(item => item.province !== '海外');
    State.currentDetailProvinceName = '国内同好会';
    State.currentDetailRows = allDomesticRows;
    renderCurrentDetail();
    hideMapBubble();
    State.mapViewState?.g.selectAll('.province').classed('selected', false);
  });

  document.getElementById('calendarToggleBtn')?.addEventListener('click', () => {
    document.getElementById('calendarModal')?.classList.add('open');
    document.getElementById('calendarModal')?.setAttribute('aria-hidden', 'false');
  });

  document.getElementById('map')?.addEventListener('click', (e) => {
    if (!e.target.closest('#badgeBubble') && !e.target.closest('.count-badge')) hideMapBubble();
  });

  const refreshBtn = document.getElementById('refreshApiBtn');
  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.textContent = '刷新中...';
    refreshBtn.disabled = true;
    await reloadBandoriData();
    refreshBtn.disabled = false;
    refreshBtn.textContent = '刷新数据';
    refreshBtn.classList.remove('show');
  });

  document.getElementById('introCloseBtn')?.addEventListener('click', () => document.getElementById('introCard')?.classList.add('collapsed'));
  document.getElementById('introExpandBtn')?.addEventListener('click', () => document.getElementById('introCard')?.classList.remove('collapsed'));
  
  const invertSwitch = document.getElementById('invertCtrlSwitch');
  invertSwitch?.addEventListener('change', () => {
    State.invertCtrlBubble = !!invertSwitch.checked;
    const label = document.getElementById('invertCtrlLabel');
    if(label) label.textContent = State.invertCtrlBubble ? '反转操作（已开启）' : '反转操作（默认关）';
  });

  const themeSwitch = document.getElementById('themeSwitch');
  themeSwitch?.addEventListener('change', () => {
    const currentEffectiveTheme = getPreferredTheme();
    const nextTheme = currentEffectiveTheme === 'dark' ? 'light' : 'dark';
    setThemePreference(nextTheme);
  });
  themeSwitch?.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    setThemePreference('system');
  });

  const feedbackModal = document.getElementById('feedbackModal');
  document.getElementById('feedbackModalBtn')?.addEventListener('click', () => { 
    feedbackModal?.classList.add('open'); 
    feedbackModal?.setAttribute('aria-hidden', 'false'); 
  });
  document.getElementById('feedbackModalClose')?.addEventListener('click', () => { 
    feedbackModal?.classList.remove('open'); 
    feedbackModal?.setAttribute('aria-hidden', 'true'); 
  });
  feedbackModal?.addEventListener('click', (e) => { 
    if (e.target === feedbackModal) feedbackModal.classList.remove('open'); 
  });

  document.addEventListener('contextmenu', (e) => {
    if (State.developerModeEnabled) return;
    e.preventDefault();
    if (e.target.closest('#siteFooter')) {
      document.getElementById('siteFooter')?.classList.add('site-footer-hidden');
      return;
    }
    if (refreshBtn) {
      const nextLeft = `${Math.min(Math.max(8, window.innerWidth - 120), e.clientX + 8)}px`;
      const nextTop = `${Math.min(Math.max(8, window.innerHeight - 48), e.clientY + 8)}px`;
      const wasOpen = refreshBtn.classList.contains('show');
      if (!wasOpen) refreshBtn.classList.add('instant-place');
      refreshBtn.style.left = nextLeft;
      refreshBtn.style.top = nextTop;
      refreshBtn.classList.add('show');
      if (!wasOpen) {
        void refreshBtn.offsetHeight;
        refreshBtn.classList.remove('instant-place');
      }
    }
  }, true);
  
  document.addEventListener('click', (e) => { 
    if (e.target !== refreshBtn) refreshBtn?.classList.remove('show'); 
  }, true);

  let easterClickCount = 0, easterTimer = null;
  document.getElementById('introTitle')?.addEventListener('click', () => {
    easterClickCount++;
    clearTimeout(easterTimer);
    easterTimer = setTimeout(() => easterClickCount = 0, 2600);
    if (easterClickCount >= 10) {
      easterClickCount = 0;
      const modal = document.getElementById('easterModal');
      document.getElementById('easterText').textContent = '彩蛋内容';
      modal?.classList.add('open');
    }
  });
  document.getElementById('easterModalClose')?.addEventListener('click', () => document.getElementById('easterModal')?.classList.remove('open'));

  document.addEventListener('touchmove', (e) => { 
    if (Utils.isMobileViewport() && e.touches.length >= 2 && !e.target.closest('#map')) e.preventDefault(); 
  }, { passive: false });
  ['gesturestart', 'gesturechange'].forEach(evt => document.addEventListener(evt, (e) => { 
    if (Utils.isMobileViewport() && !e.target.closest('#map')) e.preventDefault(); 
  }, { passive: false }));

  document.getElementById('chinaToggleBtn')?.addEventListener('click', switchToChinaMap);
  document.getElementById('japanToggleBtn')?.addEventListener('click', switchToJapanMap);
  document.getElementById('otherToggleBtn')?.addEventListener('click', () => {
    setGlobalSearchEnabled(false);
    State.selectedProvinceKey = '其他';
    showProvinceDetails('其他');
    hideMapBubble();
  });
    document.getElementById('map')?.addEventListener('click', function(e) {
        const provincePath = e.target.closest('.province');
        if (!provincePath) return;
        
        const chinaIdToName = {
            'hlj': '黑龙江', 'jl': '吉林', 'ln': '辽宁', 'hb': '河北', 'sd': '山东',
            'js': '江苏', 'zj': '浙江', 'ah': '安徽', 'hn': '河南', 'sx': '山西',
            'snx': '陕西', 'gs': '甘肃', 'hub': '湖北', 'jx': '江西', 'hun': '湖南',
            'gz': '贵州', 'sc': '四川', 'yn': '云南', 'qh': '青海', 'han': '海南',
            'cq': '重庆', 'tj': '天津', 'bj': '北京', 'nx': '宁夏', 'im': '内蒙古',
            'gx': '广西', 'xj': '新疆', 'tb': '西藏', 'sh': '上海', 'fj': '福建',
            'gd': '广东', 'hk': '香港', 'mc': '澳门', 'tw': '台湾'
        };
        
        const japanIdToName = {
            'JP-01': '北海道', 'JP-02': '青森県', 'JP-03': '岩手県', 'JP-04': '宮城県',
            'JP-05': '秋田県', 'JP-06': '山形県', 'JP-07': '福島県', 'JP-08': '茨城県',
            'JP-09': '栃木県', 'JP-10': '群馬県', 'JP-11': '埼玉県', 'JP-12': '千葉県',
            'JP-13': '東京都', 'JP-14': '神奈川県', 'JP-15': '新潟県', 'JP-16': '富山県',
            'JP-17': '石川県', 'JP-18': '福井県', 'JP-19': '山梨県', 'JP-20': '長野県',
            'JP-21': '岐阜県', 'JP-22': '静岡県', 'JP-23': '愛知県', 'JP-24': '三重県',
            'JP-25': '滋賀県', 'JP-26': '京都府', 'JP-27': '大阪府', 'JP-28': '兵庫県',
            'JP-29': '奈良県', 'JP-30': '和歌山県', 'JP-31': '鳥取県', 'JP-32': '島根県',
            'JP-33': '岡山県', 'JP-34': '広島県', 'JP-35': '山口県', 'JP-36': '徳島県',
            'JP-37': '香川県', 'JP-38': '愛媛県', 'JP-39': '高知県', 'JP-40': '福岡県',
            'JP-41': '佐賀県', 'JP-42': '長崎県', 'JP-43': '熊本県', 'JP-44': '大分県',
'JP-45': '宮崎県', 'JP-46': '鹿児島県', 'JP-47': '沖縄県'
        };
        
        let provinceName = chinaIdToName[provincePath.id];
        if (!provinceName) {
            provinceName = japanIdToName[provincePath.id];
        }
        
        if (provinceName) {
            console.log('🗺️ 点击地区:', provinceName);
            showProvinceDetails(provinceName);
        }
    });
    // =======================================
}

// ==========================================
// 管理员模式
// ==========================================
function toggleAdminMode() {
  if (!State.developerModeEnabled) {
    alert('请先连续点击「重置」按钮6次开启开发者模式');
    return false;
  }
  if (!adminMode) localStorage.setItem('admin_token', 'ciallo');
  else localStorage.removeItem('admin_token');
  adminMode = !adminMode;
  const floatingAdminBtn = document.getElementById('floatingAdminBtn');
  const addClubBtn = document.getElementById('addClubBtn');
  const calendarAddEventBtn = document.getElementById('calendarAddEventBtn');
  const calendarAddEventBtnSide = document.getElementById('calendarAddEventBtnSide');
  
  if (adminMode) {
    floatingAdminBtn?.classList.add('admin-active');
    floatingAdminBtn.title = '退出管理员模式';
    if (addClubBtn) addClubBtn.style.display = 'flex';
    if (calendarAddEventBtn) calendarAddEventBtn.style.display = 'flex';
    if (calendarAddEventBtnSide) calendarAddEventBtnSide.style.display = 'flex';
    document.body.classList.add('admin-mode');
    console.log('✅ 管理员模式已开启');
  } else {
    floatingAdminBtn?.classList.remove('admin-active');
    floatingAdminBtn.title = '管理员模式';
    if (addClubBtn) addClubBtn.style.display = 'none';
    if (calendarAddEventBtn) calendarAddEventBtn.style.display = 'none';
    if (calendarAddEventBtnSide) calendarAddEventBtnSide.style.display = 'none';
    document.body.classList.remove('admin-mode');
    console.log('✅ 管理员模式已关闭');
  }
  
  if (typeof renderCalendar === 'function') {
    renderCalendar();
  }
  
  window.dispatchEvent(new CustomEvent('adminModeChanged'));
  
  return true;
}

function openEditPanel(club = null, isNew = false) {
  const adminPanel = document.getElementById('adminPanel');
  const adminPanelTitle = document.getElementById('adminPanelTitle');
  const editId = document.getElementById('editId');
  const editCountry = document.getElementById('editCountry');
  const editName = document.getElementById('editName');
  const editProvince = document.getElementById('editProvince');
  const editPrefecture = document.getElementById('editPrefecture');
  const editType = document.getElementById('editType');
  const editInfo = document.getElementById('editInfo');
  const editRemark = document.getElementById('editRemark');
  const editSchool = document.getElementById('editSchool');
  const adminDeleteBtn = document.getElementById('adminDeleteBtn');
  const provinceGroup = document.getElementById('provinceGroup');
  const prefectureGroup = document.getElementById('prefectureGroup');
  
  if (!adminPanel) return;
  
  function toggleRegionFields(country) {
    if (country === 'japan') {
      if (provinceGroup) provinceGroup.style.display = 'none';
      if (prefectureGroup) prefectureGroup.style.display = 'block';
      if (editProvince) editProvince.required = false;
      if (editPrefecture) editPrefecture.required = true;
    } else {
      if (provinceGroup) provinceGroup.style.display = 'block';
      if (prefectureGroup) prefectureGroup.style.display = 'none';
      if (editProvince) editProvince.required = true;
      if (editPrefecture) editPrefecture.required = false;
    }
  }
  
  function setSelectValue(select, value) {
    if (!select || !value) return;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === value || select.options[i].text === value) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  
  if (isNew) {
    adminPanelTitle.textContent = '➕ 添加同好会';
    if (editId) editId.value = '';
    if (editCountry) editCountry.value = 'china';
    if (editName) editName.value = '';
    if (editProvince) editProvince.value = '';
    if (editPrefecture) editPrefecture.value = '';
    if (editType) editType.value = 'school';
    if (editInfo) editInfo.value = '';
    if (editRemark) editRemark.value = '';
    if (editSchool) editSchool.value = '';
    if (adminDeleteBtn) adminDeleteBtn.style.display = 'none';
    currentEditClubId = null;
    toggleRegionFields('china');
  } else if (club) {
    adminPanelTitle.textContent = '✏️ 编辑同好会';
    if (editId) editId.value = club.id || '';
    const country = club.country || (club.prefecture ? 'japan' : 'china');
    if (editCountry) editCountry.value = country;
    if (editName) editName.value = club.name || '';
    if (club.province) setSelectValue(editProvince, club.province);
    if (club.prefecture) setSelectValue(editPrefecture, club.prefecture);
    if (editType) editType.value = club.type || 'school';
    if (editInfo) editInfo.value = club.originalInfo || club.info || '';
    if (editRemark) editRemark.value = club.remark || '';
    if (editSchool) editSchool.value = club.school || '';
    if (adminDeleteBtn) adminDeleteBtn.style.display = 'block';
    currentEditClubId = club.id;
    toggleRegionFields(country);
  }
  
  if (editCountry) {
    editCountry.onchange = function() {
      toggleRegionFields(this.value);
    };
  }
  
  adminPanel.classList.add('open');
}

function closeAdminPanel() {
  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel) adminPanel.classList.remove('open');
  currentEditClubId = null;
}

async function saveClub() {
  const editId = document.getElementById('editId');
  const editCountry = document.getElementById('editCountry');
  const editName = document.getElementById('editName');
  const editProvince = document.getElementById('editProvince');
  const editPrefecture = document.getElementById('editPrefecture');
  const editType = document.getElementById('editType');
  const editInfo = document.getElementById('editInfo');
  const editRemark = document.getElementById('editRemark');
  const editSchool = document.getElementById('editSchool');
  
  const country = editCountry?.value || 'china';
  
  const clubData = {
    name: editName?.value.trim() || '',
    type: editType?.value || 'school',
    info: editInfo?.value.trim() || '',
    remark: editRemark?.value.trim() || '',
    school: editSchool?.value.trim() || '',
    verified: 1,
    country: country
  };
  
  if (country === 'japan') {
    const prefectureSelect = editPrefecture;
    clubData.prefecture = prefectureSelect?.options[prefectureSelect.selectedIndex]?.text || '';
    if (!clubData.prefecture) {
      alert('请选择日本县/都/府/道');
      return;
    }
  } else {
    const provinceSelect = editProvince;
    clubData.province = provinceSelect?.options[provinceSelect.selectedIndex]?.text || '';
    if (!clubData.province) {
      alert('请选择省份');
      return;
    }
  }
  
  if (!clubData.name) {
    alert('请填写组织名称');
    return;
  }
  if (!clubData.info) {
    alert('请填写联系方式');
    return;
  }
  
  const isEdit = currentEditClubId !== null;
  const adminToken = localStorage.getItem('admin_token');
  const apiUrl = country === 'japan' ? './api/clubs_japan.php' : './api/clubs.php';
  
  try {
    let response;
    if (isEdit) {
      clubData.id = currentEditClubId;
      response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(clubData)
      });
    } else {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(clubData)
      });
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert(isEdit ? '✅ 更新成功！' : '✅ 添加成功！');
      if (country === 'japan') {
        await loadJapanData();
        if (State.currentCountry === 'japan') {
          renderJapanMap();
        }
      } else {
        await reloadBandoriData();
      }
      closeAdminPanel();
    } else {
      alert('保存失败：' + (result.message || '未知错误'));
    }
  } catch (err) {
    console.error('保存失败：', err);
    alert('保存失败，请检查网络连接或 API 配置');
  }
}

async function deleteClub() {
    if (!confirm('⚠️ 确定要删除这个同好会吗？此操作不可撤销！')) return;
    const adminToken = localStorage.getItem('admin_token');
    try {
        const response = await fetch('./api/clubs.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
            body: JSON.stringify({ id: currentEditClubId })
        });
        const result = await response.json();
        if (result.success) {
            alert('✅ 删除成功！');
            await reloadBandoriData();
            closeAdminPanel();
        } else {
            alert('删除失败：' + (result.message || '未知错误'));
        }
    } catch (err) {
        console.error('删除失败：', err);
        alert('删除失败，请检查网络连接');
    }
}

function initAdminEvents() {
  const floatingAdminBtn = document.getElementById('floatingAdminBtn');
  if (!floatingAdminBtn) { setTimeout(initAdminEvents, 100); return; }
  
  const addClubBtn = document.getElementById('addClubBtn');
  const calendarAddEventBtn = document.getElementById('calendarAddEventBtn');
  const calendarAddEventBtnSide = document.getElementById('calendarAddEventBtnSide');
  const adminCancelBtn = document.getElementById('adminCancelBtn');
  const adminSaveBtn = document.getElementById('adminSaveBtn');
  const adminDeleteBtn = document.getElementById('adminDeleteBtn');
  const adminPanel = document.getElementById('adminPanel');
  
  floatingAdminBtn.style.display = State.developerModeEnabled ? 'flex' : 'none';
  
  floatingAdminBtn.addEventListener('click', () => {
    if (!State.developerModeEnabled) {
      alert('请先连续点击「重置」按钮6次开启开发者模式');
      return;
    }
    if (!adminMode) {
      const pwd = prompt('🔐 请输入管理员密码：');
      if (pwd !== ADMIN_PASSWORD) { alert('❌ 密码错误！'); return; }
    }
    toggleAdminMode();
  });
  
  if (addClubBtn) {
    addClubBtn.addEventListener('click', () => {
      if (!State.developerModeEnabled) { alert('请先开启开发者模式'); return; }
      openEditPanel(null, true);
    });
  }
  
  if (calendarAddEventBtn) {
    calendarAddEventBtn.addEventListener('click', () => {
      if (!State.developerModeEnabled) { alert('请先开启开发者模式'); return; }
      if (!adminMode) { alert('请先进入管理员模式'); return; }
      if (typeof openEventEditor === 'function') {
        openEventEditor(null);
      } else {
        console.warn('openEventEditor 未定义');
      }
    });
  }
  
  if (adminCancelBtn) adminCancelBtn.addEventListener('click', closeAdminPanel);
  if (adminSaveBtn) adminSaveBtn.addEventListener('click', saveClub);
  if (adminDeleteBtn) adminDeleteBtn.addEventListener('click', deleteClub);
  
  if (adminPanel) {
    adminPanel.addEventListener('click', (e) => { if (e.target === adminPanel) closeAdminPanel(); });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e' && adminMode) { e.preventDefault(); exportData(); }
  });
  
  console.log('✅ 管理员事件已初始化');
}

// ==========================================
// 刊物管理模块
// ==========================================
let publications = [];

async function loadPublications() {
  try {
    const resp = await fetch('./data/publications.json', { cache: 'no-store' });
    if (resp.ok) {
      const json = await resp.json();
      publications = json.publications || [];
    } else {
      publications = [];
    }
  } catch (e) {
    console.error('加载刊物失败:', e);
    publications = [];
  }
  renderPublicationList();
}

const statusMap = {
  'planning': { text: '📋 策划中', class: 'planning' },
  'writing': { text: '✍️ 征稿中', class: 'writing' },
  'editing': { text: '🔧 编辑中', class: 'editing' },
  'publishing': { text: '📢 即将发布', class: 'publishing' },
  'completed': { text: '✅ 已发布', class: 'completed' },
  'suspended': { text: '⏸️ 暂停', class: 'suspended' }
};

function renderPublicationList() {
  const container = document.getElementById('publicationList');
  if (!container) return;
  if (!publications.length) {
    container.innerHTML = '<div class="empty-text" style="text-align: center; padding: 40px;">暂无刊物信息，欢迎投稿~</div>';
    return;
  }
  const isAdmin = adminMode;
  container.innerHTML = publications.map(pub => {
    const status = statusMap[pub.status] || statusMap.planning;
    // 优先显示投稿账号/邮箱，如果没有则显示链接
    const contactInfo = pub.submitContact || pub.submitLink || '';
    const isEmail = contactInfo.includes('@') && !contactInfo.startsWith('http');
    const contactDisplay = isEmail 
      ? `<a href="mailto:${contactInfo}" class="pub-link">✉️ ${contactInfo}</a>`
      : (contactInfo.startsWith('http') 
          ? `<a href="${contactInfo}" target="_blank" rel="noopener noreferrer" class="pub-link">🔗 投稿入口</a>`
          : (contactInfo ? `<span class="pub-contact">📧 ${contactInfo}</span>` : ''));
    
    return `
      <div class="publication-item" data-id="${pub.id}">
        <div class="pub-header">
          <span class="pub-club-name">${Utils.escapeHTML(pub.clubName)}</span>
          <span class="pub-status ${status.class}">${status.text}</span>
        </div>
        <div class="pub-name">📖 ${Utils.escapeHTML(pub.publicationName)}</div>
        <div class="pub-info">
          ${contactDisplay ? `<div class="pub-contact-info">${contactDisplay}</div>` : ''}
          ${pub.deadline ? `<span class="pub-deadline">⏰ 截止：${pub.deadline}</span>` : ''}
        </div>
        <div class="pub-description">${Utils.escapeHTML(pub.description || '暂无介绍')}</div>
        ${isAdmin ? `<button class="pub-edit-btn" data-id="${pub.id}">✏️ 编辑</button>` : ''}
      </div>
    `;
  }).join('');
  
  if (isAdminMode()) {
    document.querySelectorAll('.pub-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        const pub = publications.find(p => p.id === id);
        if (pub) openPublicationEditor(pub);
      });
    });
  }
}

function openPublicationEditor(publication = null) {
  const modal = document.getElementById('publicationEditorModal');
  const title = document.getElementById('publicationEditorTitle');
  const pubId = document.getElementById('pubEditId');
  const clubName = document.getElementById('pubClubName');
  const pubName = document.getElementById('pubName');
  const status = document.getElementById('pubStatus');
  const submitContact = document.getElementById('pubSubmitContact');  // 改为投稿账号/邮箱
  const submitLink = document.getElementById('pubSubmitLink');        // 保留链接字段
  const deadline = document.getElementById('pubDeadline');
  const description = document.getElementById('pubDescription');
  const deleteBtn = document.getElementById('pubDeleteBtn');
  
  if (publication) {
    title.textContent = '✏️ 编辑刊物';
    if (pubId) pubId.value = publication.id;
    if (clubName) clubName.value = publication.clubName || '';
    if (pubName) pubName.value = publication.publicationName || '';
    if (status) status.value = publication.status || 'planning';
    if (submitContact) submitContact.value = publication.submitContact || '';
    if (submitLink) submitLink.value = publication.submitLink || '';
    if (deadline) deadline.value = publication.deadline || '';
    if (description) description.value = publication.description || '';
    if (deleteBtn) deleteBtn.style.display = 'block';
  } else {
    title.textContent = '➕ 添加刊物';
    if (pubId) pubId.value = '';
    if (clubName) clubName.value = '';
    if (pubName) pubName.value = '';
    if (status) status.value = 'planning';
    if (submitContact) submitContact.value = '';
    if (submitLink) submitLink.value = '';
    if (deadline) deadline.value = '';
    if (description) description.value = '';
    if (deleteBtn) deleteBtn.style.display = 'none';
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closePublicationEditor() {
  const modal = document.getElementById('publicationEditorModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

async function savePublication() {
  const pubId = document.getElementById('pubEditId').value;
  const clubName = document.getElementById('pubClubName').value.trim();
  const pubName = document.getElementById('pubName').value.trim();
  const status = document.getElementById('pubStatus').value;
  const submitContact = document.getElementById('pubSubmitContact').value.trim();
  const submitLink = document.getElementById('pubSubmitLink').value.trim();
  const deadline = document.getElementById('pubDeadline').value;
  const description = document.getElementById('pubDescription').value.trim();
  
  if (!clubName) { alert('请填写同好会名称'); return; }
  if (!pubName) { alert('请填写刊物名称'); return; }
  
  const adminToken = localStorage.getItem('admin_token');
  const isEdit = pubId !== '';
  const data = { 
    clubName, 
    publicationName: pubName, 
    status, 
    submitContact,  // 投稿账号/邮箱
    submitLink,     // 投稿链接（备用）
    deadline, 
    description 
  };
  if (isEdit) data.id = parseInt(pubId);
  
  try {
    const response = await fetch('./api/publications.php', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success) {
      alert(isEdit ? '✅ 刊物已更新' : '✅ 刊物已添加');
      await loadPublications();
      closePublicationEditor();
    } else {
      alert('保存失败：' + (result.message || '未知错误'));
    }
  } catch (err) {
    console.error('保存失败:', err);
    alert('保存失败，请检查网络连接');
  }
}

async function deletePublication() {
  const pubId = document.getElementById('pubEditId').value;
  if (!pubId) return;
  if (!confirm('⚠️ 确定要删除这个刊物吗？此操作不可撤销！')) return;
  const adminToken = localStorage.getItem('admin_token');
  try {
    const response = await fetch('./api/publications.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
      body: JSON.stringify({ id: parseInt(pubId) })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ 删除成功');
      await loadPublications();
      closePublicationEditor();
    } else {
      alert('删除失败：' + (result.message || '未知错误'));
    }
  } catch (err) {
    console.error('删除失败:', err);
    alert('删除失败，请检查网络连接');
  }
}

function initPublicationEvents() {
  const publicationBtn = document.getElementById('publicationToggleBtn');
  const modal = document.getElementById('publicationModal');
  const closeBtn = document.getElementById('publicationModalClose');
  const addBtn = document.getElementById('addPublicationBtn');
  const editorCloseBtn = document.getElementById('publicationEditorClose');
  const saveBtn = document.getElementById('pubSaveBtn');
  const deleteBtn = document.getElementById('pubDeleteBtn');
  publicationBtn?.addEventListener('click', () => {
    renderPublicationList();
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
  });
  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  });
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
  addBtn?.addEventListener('click', () => {
    if (!adminMode) { alert('请先开启管理员模式'); return; }
    openPublicationEditor(null);
  });
  editorCloseBtn?.addEventListener('click', closePublicationEditor);
  saveBtn?.addEventListener('click', savePublication);
  deleteBtn?.addEventListener('click', deletePublication);
  window.addEventListener('adminModeChanged', () => {
    const addBtnElem = document.getElementById('addPublicationBtn');
    if (addBtnElem) addBtnElem.style.display = adminMode ? 'block' : 'none';
    renderPublicationList();
  });
}

// ==========================================
// 移动端悬浮菜单
// ==========================================
(function initFabMenu() {
  function init() {
    const fabMenu = document.getElementById('fabMenu');
    const fabMainBtn = document.getElementById('fabMainBtn');
    if (!fabMenu || !fabMainBtn) { setTimeout(init, 500); return; }
    const isMobile = window.innerWidth <= 720;
    if (!isMobile) { fabMenu.style.display = 'none'; return; }
    fabMenu.style.display = 'flex';
    fabMainBtn.onclick = function(e) { e.stopPropagation(); fabMenu.classList.toggle('open'); };
    document.addEventListener('click', function(e) { if (fabMenu.classList.contains('open') && !fabMenu.contains(e.target)) fabMenu.classList.remove('open'); });
    document.querySelectorAll('.fab-menu-item').forEach(item => {
      item.onclick = function(e) { e.stopPropagation(); fabMenu.classList.remove('open'); };
    });
    const fabChina = document.getElementById('fabChina');
    const fabJapan = document.getElementById('fabJapan');
    const fabOther = document.getElementById('fabOther');
    const fabCalendar = document.getElementById('fabCalendar');
    const fabPublication = document.getElementById('fabPublication');
    if (fabChina) fabChina.onclick = () => switchToChinaMap();
    if (fabJapan) fabJapan.onclick = () => switchToJapanMap();
    if (fabOther) fabOther.onclick = () => { setGlobalSearchEnabled(false); State.selectedProvinceKey = '其他'; showProvinceDetails('其他'); hideMapBubble(); };
    if (fabCalendar) fabCalendar.onclick = () => { document.getElementById('calendarModal')?.classList.add('open'); };
    if (fabPublication) fabPublication.onclick = () => { document.getElementById('publicationToggleBtn')?.click(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// ==========================================
// 移动端抽屉控件
// ==========================================
(function initDrawerControls() {
    function init() {
        const zoomInBtn = document.getElementById('drawerZoomInBtn');
        const zoomOutBtn = document.getElementById('drawerZoomOutBtn');
        const resetBtn = document.getElementById('drawerResetBtn');
        const originalZoomIn = document.getElementById('zoomInBtn');
        const originalZoomOut = document.getElementById('zoomOutBtn');
        const originalReset = document.getElementById('resetViewBtn');
        
        if (!originalZoomIn || !originalZoomOut || !originalReset || !zoomInBtn || !zoomOutBtn || !resetBtn) {
            setTimeout(init, 500);
            return;
        }
        
        zoomInBtn.onclick = function(e) {
            e.stopPropagation();
            originalZoomIn.click();
        };
        
        zoomOutBtn.onclick = function(e) {
            e.stopPropagation();
            originalZoomOut.click();
        };
        
        resetBtn.onclick = function(e) {
            e.stopPropagation();
            console.log('移动端重置按钮被点击');
            if (originalReset) {
                originalReset.click();
            }
        };
        
        console.log('✅ 移动端三个按钮绑定完成');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// ==========================================
// 移动端交互增强
// ==========================================
(function initMobileUI() {
  function init() {
    const isMobile = window.innerWidth <= 720;
    if (!isMobile) return;
    const introCard = document.getElementById('introCard');
    if (introCard) {
      introCard.onclick = function(e) { if (e.target.closest('a') || e.target.closest('.submit-btn')) return; this.classList.toggle('mobile-expanded'); };
    }
    const selectedCard = document.getElementById('selectedCard');
    const sheetHandle = document.getElementById('mobileSheetHandle');
    if (selectedCard && sheetHandle) {
      let startY = 0, startHeight = 0, isDragging = false;
      const minHeight = () => Math.round(window.innerHeight * 0.35);
      const maxHeight = () => Math.round(window.innerHeight * 0.85);
      function onDragMove(clientY) {
        if (!isDragging) return;
        const delta = startY - clientY;
        let newHeight = startHeight + delta;
        newHeight = Math.max(minHeight(), Math.min(maxHeight(), newHeight));
        selectedCard.style.maxHeight = newHeight + 'px';
        selectedCard.style.transition = 'none';
        if (newHeight >= maxHeight() - 20) selectedCard.classList.add('expanded');
        else if (newHeight <= minHeight() + 20) selectedCard.classList.remove('expanded');
      }
      function onDragStart(clientY) {
        isDragging = true;
        startY = clientY;
        startHeight = selectedCard.getBoundingClientRect().height;
        selectedCard.style.transition = 'none';
      }
      function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        selectedCard.style.transition = '';
        const currentHeight = selectedCard.getBoundingClientRect().height;
        const midPoint = (minHeight() + maxHeight()) / 2;
        if (currentHeight >= midPoint) {
          selectedCard.classList.add('expanded');
          selectedCard.style.maxHeight = maxHeight() + 'px';
        } else {
          selectedCard.classList.remove('expanded');
          selectedCard.style.maxHeight = minHeight() + 'px';
        }
      }
      sheetHandle.addEventListener('touchstart', (e) => { const touch = e.touches[0]; if (touch) onDragStart(touch.clientY); }, { passive: false });
      sheetHandle.addEventListener('touchmove', (e) => { const touch = e.touches[0]; if (touch) onDragMove(touch.clientY); e.preventDefault(); }, { passive: false });
      sheetHandle.addEventListener('touchend', onDragEnd);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// ==========================================
// tooltip 绑定函数
// ==========================================
function bindMapTooltip() {
    const nameMap = {
        'hlj': '黑龙江', 'jl': '吉林', 'ln': '辽宁', 'hb': '河北', 'sd': '山东',
        'js': '江苏', 'zj': '浙江', 'ah': '安徽', 'hn': '河南', 'sx': '山西',
        'snx': '陕西', 'gs': '甘肃', 'hub': '湖北', 'jx': '江西', 'hun': '湖南',
        'gz': '贵州', 'sc': '四川', 'yn': '云南', 'qh': '青海', 'han': '海南',
        'cq': '重庆', 'tj': '天津', 'bj': '北京', 'nx': '宁夏', 'im': '内蒙古',
        'gx': '广西', 'xj': '新疆', 'tb': '西藏', 'sh': '上海', 'fj': '福建',
        'gd': '广东', 'hk': '香港', 'mc': '澳门', 'tw': '台湾',
        'JP-01': '北海道', 'JP-02': '青森県', 'JP-03': '岩手県', 'JP-04': '宮城県',
        'JP-05': '秋田県', 'JP-06': '山形県', 'JP-07': '福島県', 'JP-08': '茨城県',
        'JP-09': '栃木県', 'JP-10': '群馬県', 'JP-11': '埼玉県', 'JP-12': '千葉県',
        'JP-13': '東京都', 'JP-14': '神奈川県', 'JP-15': '新潟県', 'JP-16': '富山県',
        'JP-17': '石川県', 'JP-18': '福井県', 'JP-19': '山梨県', 'JP-20': '長野県',
        'JP-21': '岐阜県', 'JP-22': '静岡県', 'JP-23': '愛知県', 'JP-24': '三重県',
        'JP-25': '滋賀県', 'JP-26': '京都府', 'JP-27': '大阪府', 'JP-28': '兵庫県',
        'JP-29': '奈良県', 'JP-30': '和歌山県', 'JP-31': '鳥取県', 'JP-32': '島根県',
        'JP-33': '岡山県', 'JP-34': '広島県', 'JP-35': '山口県', 'JP-36': '徳島県',
        'JP-37': '香川県', 'JP-38': '愛媛県', 'JP-39': '高知県', 'JP-40': '福岡県',
        'JP-41': '佐賀県', 'JP-42': '長崎県', 'JP-43': '熊本県', 'JP-44': '大分県',
        'JP-45': '宮崎県', 'JP-46': '鹿児島県', 'JP-47': '沖縄県'
    };
    
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    
    const provinces = document.querySelectorAll('.province');
    provinces.forEach(p => {
        const newP = p.cloneNode(true);
        p.parentNode.replaceChild(newP, p);
        newP.addEventListener('mouseenter', (e) => {
            const name = nameMap[newP.id] || newP.id;
            tooltip.innerHTML = `<div class="tooltip-name">${name}</div>`;
            tooltip.style.opacity = '0.9';
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
        });
        newP.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
    
    console.log('✅ tooltip 已绑定，共', provinces.length, '个区域');
}

// ==========================================
// 启动应用
// ==========================================
// ==========================================
// 启动应用 - 同时加载所有数据源
// ==========================================
async function init() {
    console.log('🚀 初始化应用...');
    
    initThemePreference();
    bindAllStaticEvents();
    bindMobileSheetResize();
    applyMobileModeLayout();
    
    // 先并行加载数据
    console.log('📡 加载数据中...');
    await Promise.all([
        loadChinaData(),
        loadJapanData()
    ]);
    await loadPublications();
    console.log('✅ 数据加载完成 - 中国:', State.bandoriRows.length, '日本:', State.japanRows.length);
    
    // 数据加载完成后再渲染地图
    State.currentCountry = 'china';
    const chinaBtn = document.getElementById('chinaToggleBtn');
    const japanBtn = document.getElementById('japanToggleBtn');
    if (chinaBtn) chinaBtn.classList.add('active');
    if (japanBtn) japanBtn.classList.remove('active');
    
    const svgEl = document.getElementById('mapSvg');
    if (svgEl) {
    svgEl.innerHTML = '';
    renderChinaMap();
    updateSummaryUI(State.currentDataSource);
    renderCurrentDetail();
}
    // 其他初始化...
    initAdminEvents();
    initPublicationEvents();
    
    // 语言设置
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'ja') {
        currentLang = 'ja';
    }
    updateUILanguage();
    
    const zhBtn = document.getElementById('langZhBtn');
    const jaBtn = document.getElementById('langJaBtn');
    if (zhBtn) {
        zhBtn.onclick = function() {
            currentLang = 'zh';
            localStorage.setItem('language', 'zh');
            updateUILanguage();
            renderCurrentDetail();
        };
    }
    if (jaBtn) {
        jaBtn.onclick = function() {
            currentLang = 'ja';
            localStorage.setItem('language', 'ja');
            updateUILanguage();
            renderCurrentDetail();
        };
    }
    
    setTimeout(bindMapTooltip, 1000);
}

// 专门加载中国数据的函数
async function loadChinaData() {
    try {
        const resp = await fetch('./data/clubs.json', { cache: 'no-store' });
        if (resp.ok) {
            const json = await resp.json();
            if (json?.data && Array.isArray(json.data)) {
                State.bandoriRows = json.data;
                State.currentDataSource = '本地JSON';
                
                // 构建省份分组
                State.provinceGroupsMap = new Map();
                State.bandoriRows.forEach(item => {
                    const key = item.type === 'non-regional' ? '__non_regional__' : Utils.normalizeProvinceName(item.province);
                    if (!key) return;
                    if (!State.provinceGroupsMap.has(key)) State.provinceGroupsMap.set(key, []);
                    State.provinceGroupsMap.get(key).push(item);
                });
                console.log('中国数据分组完成，省份数:', State.provinceGroupsMap.size);
                return true;
            }
        }
        // 如果本地文件不存在，使用示例数据
        useMockChinaData();
        return false;
    } catch (e) {
        console.error('中国数据加载失败:', e);
        useMockChinaData();
        return false;
    }
}

// 中国模拟数据（备用）
function useMockChinaData() {
    State.bandoriRows = [
        { id: 1, name: "北京大学视觉小说同好会", province: "北京", info: "123456789", type: "school", created_at: "2023-01-01", verified: 1 },
        { id: 2, name: "清华大学Gal社", province: "北京", info: "987654321", type: "school", created_at: "2023-02-01", verified: 1 },
        { id: 3, name: "复旦大学Galgame同好会", province: "上海", info: "111222333", type: "school", created_at: "2023-03-01", verified: 1 },
        { id: 4, name: "浙江大学视觉小说社", province: "浙江", info: "444555666", type: "school", created_at: "2023-04-01", verified: 1 }
    ];
    State.currentDataSource = '模拟数据';
    
    // 构建省份分组
    State.provinceGroupsMap = new Map();
    State.bandoriRows.forEach(item => {
        const key = Utils.normalizeProvinceName(item.province);
        if (!State.provinceGroupsMap.has(key)) State.provinceGroupsMap.set(key, []);
        State.provinceGroupsMap.get(key).push(item);
    });
    console.log('使用中国模拟数据，共', State.bandoriRows.length, '条');
}

// 修改原有 reloadBandoriData，改为调用 loadChinaData
async function reloadBandoriData() {
    return loadChinaData();
}

// 修改原有 loadJapanData，确保数据加载后同时构建分组
async function loadJapanData() {
    try {
        const resp = await fetch('./data/clubs_japan.json', { cache: 'no-store' });
        if (resp.ok) {
            const json = await resp.json();
            if (json?.data && Array.isArray(json.data)) {
                State.japanRows = json.data;
                // 构建日本县分组
                State.japanGroupsMap = new Map();
                State.japanRows.forEach(item => {
                    const prefecture = item.prefecture || item.province;
                    if (!prefecture) return;
                    if (!State.japanGroupsMap.has(prefecture)) {
                        State.japanGroupsMap.set(prefecture, []);
                    }
                    State.japanGroupsMap.get(prefecture).push(item);
                });
                console.log('日本数据分组完成，县数:', State.japanGroupsMap.size);
                return true;
            }
        }
        // 使用模拟数据
        useMockJapanData();
        return false;
    } catch (e) {
        console.log('日本数据加载失败，使用模拟数据:', e);
        useMockJapanData();
        return false;
    }
}

// 加载提示函数
let loadingToast = null;
function showLoadingToast(message) {
    // 创建加载提示元素
    if (!loadingToast) {
        loadingToast = document.createElement('div');
        loadingToast.id = 'globalLoadingToast';
        loadingToast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 14px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(8px);
        `;
        document.body.appendChild(loadingToast);
    }
    loadingToast.innerHTML = `
        <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <span>${message}</span>
    `;
    loadingToast.style.display = 'flex';
}

function hideLoadingToast() {
    if (loadingToast) {
        loadingToast.style.display = 'none';
    }
}

init();