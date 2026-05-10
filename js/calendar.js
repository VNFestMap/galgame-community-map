// calendar.js - 完整修复版
(function() {
  const state = {
    events: [],
    currentDate: new Date(),
    selectedDateKey: '',
    modalAnimToken: 0,
  };

  const EVENTS_FILE = './data/events.json';

  // DOM 元素缓存
  let elements = {};

  function $(id) {
    return document.getElementById(id);
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseEventDate(str) {
    if (!str) return null;
    const m = String(str).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function isAdminMode() {
    return typeof hasRole === 'function' && hasRole('manager');
  }

  // 加载活动数据
  async function loadEvents() {
    try {
      const resp = await fetch(EVENTS_FILE + '?t=' + Date.now(), { cache: 'no-store' });
      if (!resp.ok) {
        console.warn('活动文件不存在或无法读取，使用空数据');
        state.events = [];
        return;
      }
      const json = await resp.json();
      if (Array.isArray(json?.events)) {
        state.events = json.events
          .map((item) => ({
            ...item,
            parsedDate: parseEventDate(item.date),
          }))
          .filter((item) => item.parsedDate instanceof Date && !isNaN(item.parsedDate.getTime()));
      } else {
        state.events = [];
      }
      console.log(`✅ 加载了 ${state.events.length} 个活动`);
    } catch (e) {
      console.error('加载活动失败:', e);
      state.events = [];
    }
    updateAdminUI();
    renderCalendar();
  }

  // 保存活动数据到服务器
  async function saveEvents() {
    if (!isAdminMode()) {
      console.error('无管理员权限');
      return false;
    }

    try {
      const eventsToSave = state.events.map(({ parsedDate, ...rest }) => rest);
      const response = await fetch('./api/events.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSave })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.success === true;
      }
      return false;
    } catch (e) {
      console.error('保存活动失败:', e);
      return false;
    }
  }

  // 添加活动
  async function addEvent(eventData) {
    if (!isAdminMode()) {
      alert('请先开启管理员模式');
      return false;
    }

    const maxId = state.events.length > 0 
      ? Math.max(...state.events.map(e => e.id || 0)) 
      : 0;
    
    const newEvent = {
      id: maxId + 1,
      event: eventData.event,
      date: eventData.date,
      image: eventData.image || '',
      raw_text: eventData.raw_text || '',
      offical: eventData.offical ? 1 : 0,
      description: eventData.description || '',
      link: eventData.link || '',
      created_at: new Date().toISOString()
    };

    newEvent.parsedDate = parseEventDate(newEvent.date);
    state.events.push(newEvent);
    
    const success = await saveEvents();
    if (success) {
      renderCalendar();
      return true;
    }
    return false;
  }

  // 更新活动
  async function updateEvent(eventId, eventData) {
    if (!isAdminMode()) return false;

    const index = state.events.findIndex(e => e.id === eventId);
    if (index === -1) return false;

    state.events[index] = {
      ...state.events[index],
      event: eventData.event,
      date: eventData.date,
      image: eventData.image || '',
      raw_text: eventData.raw_text || '',
      offical: eventData.offical ? 1 : 0,
      description: eventData.description || '',
      link: eventData.link || '',
      updated_at: new Date().toISOString()
    };
    state.events[index].parsedDate = parseEventDate(state.events[index].date);

    const success = await saveEvents();
    if (success) {
      renderCalendar();
      return true;
    }
    return false;
  }

  // 删除活动
  async function deleteEvent(eventId) {
    if (!isAdminMode()) return false;
    
    if (!confirm('确定要删除这个活动吗？')) return false;

    const index = state.events.findIndex(e => e.id === eventId);
    if (index === -1) return false;

    state.events.splice(index, 1);
    const success = await saveEvents();
    if (success) {
      renderCalendar();
      return true;
    }
    return false;
  }

  // 打开添加/编辑活动弹窗
  function openEventEditor(editEvent = null) {
    if (!elements.eventEditorModal) {
      console.error('活动编辑器模态框未找到');
      return;
    }

    if (editEvent) {
      if (elements.eventEditorTitle) elements.eventEditorTitle.textContent = '✏️ 编辑活动';
      if (elements.eventEditorId) elements.eventEditorId.value = editEvent.id;
      if (elements.eventEditorName) elements.eventEditorName.value = editEvent.event || '';
      if (elements.eventEditorDate) elements.eventEditorDate.value = editEvent.date || '';
      if (elements.eventEditorRawText) elements.eventEditorRawText.value = editEvent.raw_text || '';
      if (elements.eventEditorImage) elements.eventEditorImage.value = editEvent.image || '';
      if (elements.eventEditorOfficial) elements.eventEditorOfficial.checked = editEvent.offical === 1;
      if (elements.eventEditorDescription) elements.eventEditorDescription.value = editEvent.description || '';
      if (elements.eventEditorLink) elements.eventEditorLink.value = editEvent.link || '';
      if (elements.eventEditorDeleteBtn) elements.eventEditorDeleteBtn.style.display = 'block';
      // 显示已有海报
      const imgUrl = editEvent.image || '';
      if (imgUrl && elements.eventImagePreview) {
        elements.eventImagePreview.src = imgUrl;
        elements.eventImagePreview.style.display = 'block';
      }
      if (elements.eventImageRemoveBtn) elements.eventImageRemoveBtn.style.display = imgUrl ? 'inline-block' : 'none';
    } else {
      if (elements.eventEditorTitle) elements.eventEditorTitle.textContent = '➕ 添加活动';
      if (elements.eventEditorId) elements.eventEditorId.value = '';
      if (elements.eventEditorName) elements.eventEditorName.value = '';
      if (elements.eventEditorDate) elements.eventEditorDate.value = '';
      if (elements.eventEditorRawText) elements.eventEditorRawText.value = '';
      if (elements.eventEditorImage) elements.eventEditorImage.value = '';
      if (elements.eventEditorOfficial) elements.eventEditorOfficial.checked = false;
      if (elements.eventEditorDescription) elements.eventEditorDescription.value = '';
      if (elements.eventEditorLink) elements.eventEditorLink.value = '';
      if (elements.eventEditorDeleteBtn) elements.eventEditorDeleteBtn.style.display = 'none';
      if (elements.eventImagePreview) { elements.eventImagePreview.src = ''; elements.eventImagePreview.style.display = 'none'; }
      if (elements.eventImageRemoveBtn) elements.eventImageRemoveBtn.style.display = 'none';
      if (elements.eventImageStatus) elements.eventImageStatus.textContent = '';
    }

    elements.eventEditorModal.classList.add('open');
    elements.eventEditorModal.setAttribute('aria-hidden', 'false');
  }

  function closeEventEditor() {
    if (elements.eventEditorModal) {
      elements.eventEditorModal.classList.remove('open');
      elements.eventEditorModal.setAttribute('aria-hidden', 'true');
    }
  }

  // 保存活动（添加或编辑）
  async function saveEventFromEditor() {
    const eventId = elements.eventEditorId?.value;
    const eventData = {
      event: elements.eventEditorName?.value.trim() || '',
      date: elements.eventEditorDate?.value || '',
      raw_text: elements.eventEditorRawText?.value.trim() || '',
      image: elements.eventEditorImage?.value.trim() || '',
      offical: elements.eventEditorOfficial?.checked || false,
      description: elements.eventEditorDescription?.value.trim() || '',
      link: elements.eventEditorLink?.value.trim() || ''
    };

    if (!eventData.event) {
      alert('请填写活动名称');
      return;
    }
    if (!eventData.date) {
      alert('请选择活动日期');
      return;
    }

    let success;
    if (eventId) {
      success = await updateEvent(parseInt(eventId), eventData);
    } else {
      success = await addEvent(eventData);
    }

    if (success) {
      closeEventEditor();
      alert(eventId ? '✅ 活动已更新' : '✅ 活动已添加');
    } else {
      alert('保存失败，请检查管理员权限');
    }
  }

  // 打开活动详情弹窗
  function openEventDetail(eventData) {
    if (!elements.eventDetailModal) {
      console.error('活动详情模态框未找到');
      return;
    }

    if (elements.eventDetailTitle) elements.eventDetailTitle.textContent = eventData.event || '活动详情';
    if (elements.eventDetailDate) elements.eventDetailDate.textContent = eventData.date || '日期待定';
    
    if (elements.eventDetailImage) {
      if (eventData.image) {
        elements.eventDetailImage.src = eventData.image;
        elements.eventDetailImage.style.display = 'block';
      } else {
        elements.eventDetailImage.style.display = 'none';
      }
    }
    
    if (elements.eventDetailDescription) {
      elements.eventDetailDescription.textContent = eventData.description || eventData.raw_text || '暂无详细介绍';
    }
    
    if (elements.eventDetailLink) {
      if (eventData.link) {
        elements.eventDetailLink.href = eventData.link;
        elements.eventDetailLink.style.display = 'inline-flex';
      } else {
        elements.eventDetailLink.style.display = 'none';
      }
    }

    const isAdmin = isAdminMode();
    if (elements.eventDetailEditBtn) elements.eventDetailEditBtn.style.display = isAdmin ? 'flex' : 'none';
    if (elements.eventDetailDeleteBtn) elements.eventDetailDeleteBtn.style.display = isAdmin ? 'flex' : 'none';

    if (elements.eventDetailEditBtn) elements.eventDetailEditBtn.dataset.eventId = eventData.id;
    if (elements.eventDetailDeleteBtn) elements.eventDetailDeleteBtn.dataset.eventId = eventData.id;

    elements.eventDetailModal.classList.add('open');
    elements.eventDetailModal.setAttribute('aria-hidden', 'false');
  }

  function closeEventDetail() {
    if (elements.eventDetailModal) {
      elements.eventDetailModal.classList.remove('open');
      elements.eventDetailModal.setAttribute('aria-hidden', 'true');
    }
  }

  function getEventById(id) {
    return state.events.find(e => e.id === id);
  }

  function updateAdminUI() {
    const isAdmin = isAdminMode();
    if (elements.calendarAddEventBtn) {
      elements.calendarAddEventBtn.style.display = isAdmin ? 'flex' : 'none';
    }
  }

  function openCalendar() {
    if (!elements.calendarModal) return;
    
    elements.calendarModal.classList.add('open');
    elements.calendarModal.setAttribute('aria-hidden', 'false');
    
    if (!state.selectedDateKey) {
      state.selectedDateKey = formatDateKey(new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), 1));
    }
    renderCalendar();
  }

  function closeCalendar() {
    if (elements.calendarModal) {
      elements.calendarModal.classList.remove('open');
      elements.calendarModal.setAttribute('aria-hidden', 'true');
    }
  }

  // 渲染日历
  function renderCalendar() {
    if (!elements.calendarGrid || !elements.calendarTitle || !elements.calendarEventList) {
      console.warn('日历DOM元素未就绪');
      return;
    }

    const current = state.currentDate;
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    elements.calendarTitle.textContent = `${year}年${month + 1}月 Galgame活动日历`;

    // 构建事件映射
    const eventMap = new Map();
    state.events.forEach((item) => {
      if (item.parsedDate) {
        const key = formatDateKey(item.parsedDate);
        if (!eventMap.has(key)) eventMap.set(key, []);
        eventMap.get(key).push(item);
      }
    });

    // 构建日历网格
    const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];
    let cells = weekLabels.map((w) => `<div class="calendar-weekday">${w}</div>`);

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push('<div class="calendar-cell empty"></div>');
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day);
      const key = formatDateKey(date);
      const events = eventMap.get(key) || [];
      const officialCount = events.filter((item) => Number(item.offical) === 1).length;
      const normalCount = events.length - officialCount;
      const selected = state.selectedDateKey === key ? 'selected' : '';
      
      let dotsHtml = '';
      if (normalCount > 0 || officialCount > 0) {
        dotsHtml = `<span class="calendar-dot-row">
          ${normalCount > 0 ? `<span class="calendar-dot">${normalCount}</span>` : ''}
          ${officialCount > 0 ? `<span class="calendar-dot official-dot">${officialCount}</span>` : ''}
        </span>`;
      }
      
      cells.push(`
        <button class="calendar-cell ${events.length ? 'has-event' : ''} ${selected}" type="button" data-date="${key}">
          <span class="calendar-day">${day}</span>
          ${dotsHtml}
        </button>
      `);
    }

    elements.calendarGrid.innerHTML = cells.join('');

    // 渲染当天活动
    renderSelectedDayEvents(state.selectedDateKey, eventMap);
  }

  function renderSelectedDayEvents(dateKey, eventMap) {
    if (!elements.calendarEventList) return;
    
    const dayEvents = eventMap.get(dateKey) || [];
    if (!dayEvents.length) {
      const current = state.currentDate;
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthEventCount = state.events.filter(
        (item) => item.parsedDate && item.parsedDate.getFullYear() === year && item.parsedDate.getMonth() === month
      ).length;
      elements.calendarEventList.innerHTML = `<div class="calendar-empty">本月有${monthEventCount}个Galgame活动</div>`;
      return;
    }

    const isAdmin = isAdminMode();

    elements.calendarEventList.innerHTML = dayEvents
      .map((item) => {
        const eventKey = encodeURIComponent(JSON.stringify({
          id: item.id,
          event: item.event || '',
          date: item.date || '',
          image: item.image || '',
          raw_text: item.raw_text || '',
          description: item.description || '',
          link: item.link || '',
          offical: item.offical || 0
        }));
        const official = Number(item.offical) === 1;
        return `
          <button class="calendar-event-item ${official ? 'official' : ''}" type="button" data-event-key="${eventKey}" data-date="${dateKey}">
            <div class="calendar-event-date">${dateKey}</div>
            <div class="calendar-event-name">${escapeHtml(item.event || '未命名活动')}</div>
            <div class="calendar-event-text">${escapeHtml(item.raw_text || '')}</div>
            ${isAdmin ? `<div class="calendar-event-admin-badge">📝</div>` : ''}
          </button>
        `;
      })
      .join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  function bindEvents() {
    // 日历按钮
    if (elements.calendarToggleBtn) {
      elements.calendarToggleBtn.addEventListener('click', openCalendar);
    }
    
    if (elements.calendarModalClose) {
      elements.calendarModalClose.addEventListener('click', closeCalendar);
    }
    
    if (elements.calendarModal) {
      elements.calendarModal.addEventListener('click', (e) => {
        if (e.target === elements.calendarModal) closeCalendar();
      });
    }

    // 月份切换
    if (elements.calendarPrevBtn) {
      elements.calendarPrevBtn.addEventListener('click', () => {
        state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1);
        renderCalendar();
      });
    }

    if (elements.calendarNextBtn) {
      elements.calendarNextBtn.addEventListener('click', () => {
        state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1);
        renderCalendar();
      });
    }

    // 活动列表点击
    if (elements.calendarEventList) {
      elements.calendarEventList.addEventListener('click', (e) => {
        const item = e.target.closest('.calendar-event-item');
        if (!item) return;
        const rawKey = item.getAttribute('data-event-key');
        if (!rawKey) return;
        try {
          const parsed = JSON.parse(decodeURIComponent(rawKey));
          const eventData = state.events.find((ev) => ev.id === parsed.id) || parsed;
          openEventDetail(eventData);
        } catch (err) {
          console.error('解析活动数据失败:', err);
        }
      });
    }

    // 日历格子点击
    if (elements.calendarGrid) {
      elements.calendarGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.calendar-cell');
        if (!cell) return;
        const dateKey = cell.getAttribute('data-date');
        if (!dateKey) return;
        state.selectedDateKey = dateKey;
        renderCalendar();
      });
    }

    // 添加活动按钮（管理员）
    if (elements.calendarAddEventBtn) {
      elements.calendarAddEventBtn.addEventListener('click', () => {
        if (!isAdminMode()) {
          alert('请先开启管理员模式');
          return;
        }
        openEventEditor(null);  // 打开活动编辑器
      });
    }

    // 活动编辑器事件
    if (elements.eventEditorCancelBtn) {
      elements.eventEditorCancelBtn.addEventListener('click', closeEventEditor);
    }
    if (elements.eventEditorSaveBtn) {
      elements.eventEditorSaveBtn.addEventListener('click', saveEventFromEditor);
    }
    if (elements.eventEditorDeleteBtn) {
      elements.eventEditorDeleteBtn.addEventListener('click', async () => {
        const eventId = elements.eventEditorId?.value;
        if (eventId) {
          await deleteEvent(parseInt(eventId));
          closeEventEditor();
        }
      });
    }

    // 活动海报上传
    if (elements.eventImageBtn && elements.eventImageInput) {
      elements.eventImageBtn.addEventListener('click', () => elements.eventImageInput.click());
      elements.eventImageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const eventId = elements.eventEditorId?.value || 'event_' + Date.now();
        const fd = new FormData();
        fd.append('image', file);
        fd.append('id', eventId);
        if (elements.eventImageStatus) elements.eventImageStatus.textContent = '上传中...';
        try {
          const r = await fetch('./api/club_avatar.php?scope=event', { method: 'POST', body: fd });
          const j = await r.json();
          if (j.success) {
            if (elements.eventImagePreview) { elements.eventImagePreview.src = j.image_url; elements.eventImagePreview.style.display = 'block'; }
            if (elements.eventEditorImage) elements.eventEditorImage.value = j.image_url;
            if (elements.eventImageRemoveBtn) elements.eventImageRemoveBtn.style.display = 'inline-block';
            if (elements.eventImageStatus) elements.eventImageStatus.textContent = '✅ 上传成功';
          } else {
            if (elements.eventImageStatus) elements.eventImageStatus.textContent = '❌ ' + (j.message || '上传失败');
          }
        } catch { if (elements.eventImageStatus) elements.eventImageStatus.textContent = '❌ 网络错误'; }
        elements.eventImageInput.value = '';
      });
    }
    if (elements.eventImageRemoveBtn) {
      elements.eventImageRemoveBtn.addEventListener('click', () => {
        if (elements.eventImagePreview) { elements.eventImagePreview.src = ''; elements.eventImagePreview.style.display = 'none'; }
        if (elements.eventEditorImage) elements.eventEditorImage.value = '';
        elements.eventImageRemoveBtn.style.display = 'none';
        if (elements.eventImageStatus) elements.eventImageStatus.textContent = '已移除海报';
      });
    }

    // 活动详情弹窗事件
    if (elements.eventDetailModal) {
      elements.eventDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.eventDetailModal) closeEventDetail();
      });
    }
    if (elements.eventDetailClose) {
      elements.eventDetailClose.addEventListener('click', closeEventDetail);
    }
    
    if (elements.eventDetailEditBtn) {
      elements.eventDetailEditBtn.addEventListener('click', () => {
        const eventId = elements.eventDetailEditBtn.dataset.eventId;
        if (eventId) {
          const eventData = getEventById(parseInt(eventId));
          if (eventData) {
            closeEventDetail();
            openEventEditor(eventData);
          }
        }
      });
    }
    
    if (elements.eventDetailDeleteBtn) {
      elements.eventDetailDeleteBtn.addEventListener('click', async () => {
        const eventId = elements.eventDetailDeleteBtn.dataset.eventId;
        if (eventId) {
          await deleteEvent(parseInt(eventId));
          closeEventDetail();
        }
      });
    }

  }

  function initElements() {
    elements = {
      calendarToggleBtn: $('calendarToggleBtn'),
      calendarModal: $('calendarModal'),
      calendarModalClose: $('calendarModalClose'),
      calendarPrevBtn: $('calendarPrevBtn'),
      calendarNextBtn: $('calendarNextBtn'),
      calendarTitle: $('calendarTitle'),
      calendarGrid: $('calendarGrid'),
      calendarEventList: $('calendarEventList'),
      calendarAddEventBtn: $('calendarAddEventBtn'),
      eventEditorModal: $('eventEditorModal'),
      eventEditorTitle: $('eventEditorTitle'),
      eventEditorId: $('eventEditorId'),
      eventEditorName: $('eventEditorName'),
      eventEditorDate: $('eventEditorDate'),
      eventEditorRawText: $('eventEditorRawText'),
      eventEditorImage: $('eventEditorImage'),
      eventEditorOfficial: $('eventEditorOfficial'),
      eventEditorDescription: $('eventEditorDescription'),
      eventEditorLink: $('eventEditorLink'),
      eventEditorCancelBtn: $('eventEditorCancelBtn'),
      eventEditorSaveBtn: $('eventEditorSaveBtn'),
      eventEditorDeleteBtn: $('eventEditorDeleteBtn'),
      eventImagePreview: $('eventImagePreview'),
      eventImageInput: $('eventImageInput'),
      eventImageBtn: $('eventImageBtn'),
      eventImageRemoveBtn: $('eventImageRemoveBtn'),
      eventImageStatus: $('eventImageStatus'),
      eventDetailModal: $('eventDetailModal'),
      eventDetailClose: $('eventDetailClose'),
      eventDetailTitle: $('eventDetailTitle'),
      eventDetailDate: $('eventDetailDate'),
      eventDetailImage: $('eventDetailImage'),
      eventDetailDescription: $('eventDetailDescription'),
      eventDetailLink: $('eventDetailLink'),
      eventDetailEditBtn: $('eventDetailEditBtn'),
      eventDetailDeleteBtn: $('eventDetailDeleteBtn')
    };
  }

  async function init() {
    console.log('📅 日历模块初始化...');
    initElements();
    
    // 等待 DOM 元素就绪
    if (!elements.calendarToggleBtn) {
      console.warn('日历按钮未找到，可能 DOM 尚未加载完成');
      // 延迟重试
      setTimeout(() => {
        if (document.getElementById('calendarToggleBtn')) {
          initElements();
          init();
        }
      }, 500);
      return;
    }
    
    await loadEvents();
    bindEvents();
    updateAdminUI();
    window.addEventListener('auth:updated', updateAdminUI);
    console.log('✅ 日历模块初始化完成');
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();