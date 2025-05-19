// 读取小说内容和速度（改用local）
function getNovelContentAndSpeed(callback) {
  chrome.storage.local.get(['novelContent', 'novelSpeed'], function(result) {
    let speed = result.novelSpeed ? Number(result.novelSpeed) : 35; // 速度：像素/秒
    let content = result.novelContent;
    if (content && content.trim() !== "") {
      callback(content, speed);
    } else {
      // 默认小说片段
      fetch(chrome.runtime.getURL('novel_data.json'))
        .then(response => response.json())
        .then(data => callback(data.content, speed));
    }
  });
}

// 创建小说轮播栏
function createNovelBar(content, speed) {
  if (document.getElementById('moyu-novel-bar')) return;

  let nav = document.querySelector('nav') || document.body;
  let bar = document.createElement('div');
  bar.id = 'moyu-novel-bar';
  bar.style.cssText = `
    width: 100%;
    background: #f8f8f8;
    color: #333;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    border-bottom: 1px solid #eee;
    position: relative;
    z-index: 9999;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    font-family: "微软雅黑", "Arial", sans-serif;
    user-select: none;
  `;

  // 文字滚动
  let text = document.createElement('div');
  text.id = 'moyu-novel-bar-text';
  text.style.cssText = `
    display: inline-block;
    padding-left: 100%;
    will-change: transform;
    position: relative;
  `;
  text.textContent = content;

  // "继续滚动"按钮
  let btn = document.createElement('button');
  btn.textContent = '▶';
  btn.title = '继续自动滚动';
  btn.style.cssText = `
    position: absolute;
    right: 8px;
    top: 4px;
    height: 24px;
    width: 28px;
    border: none;
    background: #e0e0e0;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    z-index: 10000;
    display: none;
  `;
  bar.appendChild(btn);

  // 动画样式
  let style = document.createElement('style');
  style.textContent = `
    #moyu-novel-bar.hide { display: none !important; }
  `;
  document.head.appendChild(style);

  bar.appendChild(text);
  nav.parentNode.insertBefore(bar, nav);

  // 滚动实现
  let barWidth, textWidth, distance;
  let isAutoScrolling = true;
  let currentTransform = 0;
  let lastTimestamp = null;
  let rafId = null;
  let isDragging = false;
  let startX = 0;
  let startTransform = 0;

  function updateSizes() {
    barWidth = bar.offsetWidth;
    textWidth = text.scrollWidth;
    distance = textWidth + barWidth;
  }

  function scrollStep(ts) {
    if (!isAutoScrolling) return;
    if (!lastTimestamp) lastTimestamp = ts;
    let dt = (ts - lastTimestamp) / 1000; // 秒
    lastTimestamp = ts;
    currentTransform -= speed * dt;
    if (currentTransform <= -distance) {
      currentTransform = 0;
    }
    text.style.transform = `translateX(${currentTransform}px)`;
    rafId = requestAnimationFrame(scrollStep);
  }

  function startScroll(fromCurrent = false) {
    updateSizes();
    if (!fromCurrent) currentTransform = 0;
    lastTimestamp = null;
    isAutoScrolling = true;
    btn.style.display = 'none';
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(scrollStep);
  }

  function stopScroll() {
    isAutoScrolling = false;
    btn.style.display = 'block';
    cancelAnimationFrame(rafId);
  }

  startScroll();

  // 拖动支持
  text.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    isDragging = true;
    stopScroll();
    updateSizes();
    const match = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(text.style.transform);
    startTransform = match ? parseFloat(match[1]) : 0;
    startX = e.clientX;
    document.body.style.cursor = 'ew-resize';
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    let delta = e.clientX - startX;
    currentTransform = startTransform + delta;
    text.style.transform = `translateX(${currentTransform}px)`;
  });

  document.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    // 停留在当前位置
    text.style.transition = 'none';
    btn.style.display = 'block';
  });

  // 点击▶按钮恢复自动滚动
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!isAutoScrolling) {
      startScroll(true);
    }
  });

  // 禁止点击小说栏内容时清空内容或重置
  text.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
  bar.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });

  // 双击隐藏/显示
  bar.addEventListener('dblclick', function(e) {
    bar.classList.toggle('hide');
    e.stopPropagation();
  });
}

// 主逻辑
getNovelContentAndSpeed(function(content, speed) {
  createNovelBar(content, speed);
}); 