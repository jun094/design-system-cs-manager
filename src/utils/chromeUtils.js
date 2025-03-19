/**
 * 현재 환경이 크롬 확장 프로그램인지 확인
 */
export const isChromeExtension = () => {
    return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined';
};
/**
 * 안전하게 chrome.tabs.query 호출
 */
export const safeTabsQuery = async (queryInfo) => {
    if (!isChromeExtension()) {
        console.warn('크롬 확장 프로그램 환경이 아닙니다.');
        return [];
    }
    return new Promise((resolve) => {
        chrome.tabs.query(queryInfo, (tabs) => {
            resolve(tabs || []);
        });
    });
};
/**
 * 안전하게 chrome.tabs.captureVisibleTab 호출
 */
export const safeCaptureVisibleTab = async () => {
    if (!isChromeExtension()) {
        console.warn('크롬 확장 프로그램 환경이 아닙니다.');
        return null;
    }
    try {
        return await chrome.tabs.captureVisibleTab();
    }
    catch (error) {
        console.error('스크린샷 캡처 실패:', error);
        return null;
    }
};
/**
 * 안전하게 chrome.scripting.executeScript 호출
 */
export const safeExecuteScript = async (tabId, func) => {
    if (!isChromeExtension()) {
        console.warn('크롬 확장 프로그램 환경이 아닙니다.');
        return null;
    }
    try {
        // @ts-ignore
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func
        });
        return results?.[0] || null;
    }
    catch (error) {
        console.error('스크립트 실행 실패:', error);
        return null;
    }
};
