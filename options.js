document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('novelContent');
  const status = document.getElementById('status');

  // 读取已保存内容
  chrome.storage.sync.get(['novelContent'], function(result) {
    if (result.novelContent) {
      textarea.value = result.novelContent;
    }
  });

  // 保存内容
  document.getElementById('saveBtn').addEventListener('click', function() {
    const value = textarea.value.trim();
    chrome.storage.sync.set({ novelContent: value }, function() {
      status.textContent = '保存成功！';
      setTimeout(() => status.textContent = '', 1500);
    });
  });
}); 