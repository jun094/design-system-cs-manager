// background.ts
// 백그라운드에서 실행되는 서비스 워커

// 확장 프로그램 아이콘 클릭 시 사이드 패널 열기
chrome.action.onClicked.addListener((tab) => {
  // 사이드 패널 열기
  chrome.sidePanel.open({ tabId: tab.id });
});

// 슬랙과 노션 API 통신 처리
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SEND_TO_SLACK') {
    sendToSlack(message.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error }));
    return true; // 비동기 응답을 위해 true 반환
  }
  
  if (message.type === 'SAVE_TO_NOTION') {
    saveToNotion(message.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error }));
    return true;
  }
  
  if (message.type === 'FETCH_FROM_NOTION') {
    fetchFromNotion(message.queryType)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error }));
    return true;
  }
});

async function sendToSlack(data: any) {
  // 슬랙 API 호출 로직
  // 실제 구현에서는 슬랙 웹훅 URL을 사용하여 메시지 전송
  console.log('슬랙에 전송:', data);
  return { sent: true };
}

async function saveToNotion(data: any) {
  // 노션 API 호출 로직
  // 실제 구현에서는 노션 API를 사용하여 데이터베이스에 저장
  console.log('노션에 저장:', data);
  return { saved: true };
}

async function fetchFromNotion(queryType: string) {
  // 노션 API 호출 로직
  // 실제 구현에서는 노션 API를 사용하여 데이터베이스에서 조회
  console.log('노션에서 조회:', queryType);
  
  // 테스트 데이터 반환
  return {
    items: [
      // 여기에 테스트 데이터 추가
    ]
  };
} 