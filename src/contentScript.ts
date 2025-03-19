// contentScript.ts
// 웹 페이지에 주입되는 스크립트

// DOM 관련 정보 수집 등의 기능 구현
console.log('디자인 시스템 CS 도우미 콘텐츠 스크립트가 로드되었습니다.');

// 콘솔 에러 수집 로직
const errors: string[] = [];
const originalConsoleError = console.error;

console.error = function(...args) {
  const errorMessage = args.join(' ');
  errors.push(errorMessage);
  
  // 백그라운드 스크립트에 에러 전송
  chrome.runtime.sendMessage({
    type: 'CONSOLE_ERROR',
    data: { error: errorMessage, url: window.location.href }
  });
  
  // 원래 콘솔 에러 함수 호출
  return originalConsoleError.apply(console, args);
};

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CONSOLE_ERRORS') {
    sendResponse({ errors });
    return true;
  }
  
  if (message.type === 'CAPTURE_DOM') {
    const selectedElement = document.activeElement;
    if (selectedElement) {
      sendResponse({ html: selectedElement.outerHTML });
    } else {
      sendResponse({ error: '선택된 요소가 없습니다.' });
    }
    return true;
  }
});

// 추가 기능: DOM 요소 클릭 시 코드 수집 (주석 처리)
/*
document.addEventListener('click', (event) => {
  const element = event.target as HTMLElement;
  chrome.runtime.sendMessage({
    type: 'DOM_CLICKED',
    data: { html: element.outerHTML }
  });
}, true);
*/ 