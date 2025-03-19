// 개발 환경에서 사용할 모의 크롬 API
export const setupMockChromeApi = () => {
  if (typeof window === 'undefined') return;
  if (typeof chrome !== 'undefined' && chrome.runtime) return;

  // 개발 환경에서만 사용
  if (import.meta.env.DEV) {
    (window as any).chrome = {
      runtime: {
        id: 'mock-extension-id',
        getManifest: () => ({ version: '1.0.0' }),
        sendMessage: () => {},
        onMessage: {
          addListener: () => {},
          removeListener: () => {}
        }
      },
      tabs: {
        query: (_queryInfo: any, callback: (tabs: any[]) => void) => {
          callback([{
            id: 1,
            url: 'https://example.com/test-page',
            title: '테스트 페이지'
          }]);
        },
        captureVisibleTab: () => Promise.resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
      },
      scripting: {
        executeScript: () => Promise.resolve([{ result: ['콘솔 에러 1', '콘솔 에러 2'] }])
      }
    };
    
    console.log('모의 크롬 API가 설정되었습니다. 개발 환경 전용입니다.');
  }
}; 