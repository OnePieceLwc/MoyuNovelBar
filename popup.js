function updateCharCount() {
  const textarea = document.getElementById('novelContent');
  const charCount = document.getElementById('charCount');
  charCount.textContent = `当前字数：${textarea.value.length}`;
}

document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('novelContent');
  const status = document.getElementById('status');
  const fileInput = document.getElementById('fileInput');
  const speedRange = document.getElementById('speedRange');
  const speedValue = document.getElementById('speedValue');

  // 读取已保存内容和速度（改用local）
  chrome.storage.local.get(['novelContent', 'novelSpeed'], function(result) {
    if (result.novelContent) {
      textarea.value = result.novelContent;
    }
    if (result.novelSpeed) {
      speedRange.value = result.novelSpeed;
      speedValue.textContent = result.novelSpeed;
    } else {
      speedRange.value = 35;
      speedValue.textContent = 35;
    }
    updateCharCount();
  });

  // 保存内容和速度（改用local）
  document.getElementById('saveBtn').addEventListener('click', function() {
    const value = textarea.value.trim();
    const speed = speedRange.value;
    chrome.storage.local.set({ novelContent: value, novelSpeed: speed }, function() {
      status.textContent = '保存成功！';
      setTimeout(() => status.textContent = '', 1500);
      updateCharCount();
    });
  });

  // 清空内容（改用local）
  document.getElementById('clearBtn').addEventListener('click', function() {
    textarea.value = '';
    chrome.storage.local.set({ novelContent: '' }, function() {
      status.textContent = '已清空！';
      setTimeout(() => status.textContent = '', 1500);
      updateCharCount();
    });
  });

  // 恢复默认（改用local）
  document.getElementById('resetBtn').addEventListener('click', function() {
    fetch(chrome.runtime.getURL('novel_data.json'))
      .then(response => response.json())
      .then(data => {
        textarea.value = data.content;
        chrome.storage.local.set({ novelContent: data.content }, function() {
          status.textContent = '已恢复默认！';
          setTimeout(() => status.textContent = '', 1500);
          updateCharCount();
        });
      });
  });

  // 上传TXT（改用local）
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      textarea.value = evt.target.result;
      chrome.storage.local.set({ novelContent: textarea.value }, function() {
        status.textContent = 'TXT已导入并保存！';
        setTimeout(() => status.textContent = '', 1500);
        updateCharCount();
      });
    };
    reader.readAsText(file, 'utf-8');
  });

  // 字数统计
  textarea.addEventListener('input', updateCharCount);

  // 滑块显示
  speedRange.addEventListener('input', function() {
    speedValue.textContent = speedRange.value;
  });
}); 