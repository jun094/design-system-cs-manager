import React, { useState, useEffect } from 'react';
import { isChromeExtension, safeTabsQuery, safeCaptureVisibleTab, safeExecuteScript } from '../utils/chromeUtils';
import './CSForm.css';

type CSCategory = '버그 제보' | '사용법 문의' | '기타';
type LibraryInfo = {
  name: string;
  version: string;
  hasError: boolean;
};

const LIBRARIES = [
  '@goorm-dev/vapor-core',
  '@goorm-dev/vapor-components',
  '@goorm-dev/vapor-tables',
  '@goorm-dev/vapor-charts'
];

const CSForm: React.FC = () => {
  const [category, setCategory] = useState<CSCategory>('버그 제보');
  const [description, setDescription] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  const [priority, setPriority] = useState<'높음' | '보통' | '낮음'>('보통');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isExtensionEnv, setIsExtensionEnv] = useState(false);
  
  // 라이브러리 정보 상태 추가
  const [libraryInfo, setLibraryInfo] = useState<LibraryInfo[]>(
    LIBRARIES.map(name => ({ name, version: '', hasError: false }))
  );
  const [externalCssUrl, setExternalCssUrl] = useState('');
  const [hasExternalCssError, setHasExternalCssError] = useState(false);
  const [showLibrarySection, setShowLibrarySection] = useState(false);

  // 환경 확인
  useEffect(() => {
    const checkEnv = () => {
      const isExt = isChromeExtension();
      setIsExtensionEnv(isExt);
      
      if (!isExt) {
        setMessage('주의: 크롬 확장 프로그램 환경이 아닙니다. 일부 기능이 작동하지 않을 수 있습니다.');
      }
    };
    
    checkEnv();
  }, []);

  // 현재 페이지 URL 가져오기
  useEffect(() => {
    const getPageUrl = async () => {
      try {
        const tabs = await safeTabsQuery({ active: true, currentWindow: true });
        if (tabs.length > 0 && tabs[0].url) {
          setPageUrl(tabs[0].url);
        }
      } catch (error) {
        console.error('URL 가져오기 실패:', error);
      }
    };
    
    if (isExtensionEnv) {
      getPageUrl();
    }
  }, [isExtensionEnv]);

  // 스크린샷 및 콘솔 에러 가져오기
  useEffect(() => {
    const captureScreenshot = async () => {
      try {
        // 활성 탭 정보 가져오기
        const tabs = await safeTabsQuery({ active: true, currentWindow: true });
        if (!tabs.length || !tabs[0].id) return;
        
        const tabId = tabs[0].id;
        
        // 스크린샷 캡처
        const imgData = await safeCaptureVisibleTab();
        if (imgData) {
          setScreenshot(imgData);
        }
        
        // 콘솔 에러 수집
        const result = await safeExecuteScript(tabId, collectConsoleErrors);
        if (result?.result) {
          setConsoleErrors(result.result);
          
          // 콘솔 에러에서 라이브러리 관련 에러가 있는지 확인
          const errorText = result.result.join(' ');
          const hasLibraryErrors = LIBRARIES.some(lib => errorText.includes(lib));
          
          if (hasLibraryErrors) {
            setShowLibrarySection(true);
            
            // 라이브러리 정보 업데이트
            setLibraryInfo(prev => 
              prev.map(lib => ({
                ...lib,
                hasError: errorText.includes(lib.name)
              }))
            );
          }
          
          // 외부 CSS 오류 확인
          if (errorText.includes('CSS') || errorText.includes('stylesheet')) {
            setHasExternalCssError(true);
            setShowLibrarySection(true);
          }
        }
      } catch (error) {
        console.error('캡처 실패:', error);
      }
    };
    
    if (isExtensionEnv) {
      captureScreenshot();
    }
  }, [isExtensionEnv]);

  // 콘솔 에러 수집 함수 (웹페이지에서 실행됨)
  const collectConsoleErrors = (): string[] => {
    // 페이지의 콘솔 에러를 수집하는 로직
    // 실제 구현에서는 페이지의 console.error를 후킹하거나
    // window.onerror 등을 활용하여 에러 수집
    
    // 테스트를 위한 더미 데이터
    return [
      'Error: Cannot read property "length" of undefined',
      'TypeError: Object is not a function'
    ];
  };

  // 라이브러리 정보 업데이트 핸들러
  const handleLibraryChange = (index: number, field: 'version' | 'hasError', value: string | boolean) => {
    const newLibraryInfo = [...libraryInfo];
    newLibraryInfo[index] = {
      ...newLibraryInfo[index],
      [field]: value
    };
    setLibraryInfo(newLibraryInfo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!isExtensionEnv) {
        setMessage('크롬 확장 프로그램 환경에서만 제출이 가능합니다.');
        return;
      }
      
      // CS 데이터 준비
      const csData = {
        category,
        description,
        pageUrl,
        screenshot,
        consoleErrors,
        priority,
        libraryInfo: libraryInfo.filter(lib => lib.hasError),
        externalCssUrl: hasExternalCssError ? externalCssUrl : null
      };
      
      // 1. 슬랙 메시지 보내기
      await sendToSlack(csData);
      
      // 2. 노션 데이터베이스에 저장
      await saveToNotion(csData);
      
      setMessage('CS가 성공적으로 제출되었습니다.');
      // 폼 초기화
      setDescription('');
      setPriority('보통');
      setLibraryInfo(LIBRARIES.map(name => ({ name, version: '', hasError: false })));
      setExternalCssUrl('');
      setHasExternalCssError(false);
      setShowLibrarySection(false);
    } catch (error) {
      setMessage('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToSlack = async () => {
    // 슬랙 API 호출 로직
    // 실제 구현 시에는 background script를 통해 API 호출
    if (!isExtensionEnv) return;
    
    // 테스트를 위한 더미 응답
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const saveToNotion = async () => {
    // 노션 API 호출 로직
    // 실제 구현 시에는 background script를 통해 API 호출
    if (!isExtensionEnv) return;
    
    // 테스트를 위한 더미 응답
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className="cs-form">
      <h2>CS 등록하기</h2>
      
      {message && <div className="message">{message}</div>}
      
      {!isExtensionEnv && (
        <div className="warning-message">
          현재 브라우저 환경에서는 스크린샷과 콘솔 에러 수집이 제한됩니다.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>카테고리</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as CSCategory)}
          >
            <option value="버그 제보">버그 제보</option>
            <option value="사용법 문의">사용법 문의</option>
            <option value="기타">기타</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        {/* 라이브러리 섹션 */}
        <div className="form-section">
          <div className="section-header" onClick={() => setShowLibrarySection(!showLibrarySection)}>
            <h3>라이브러리 정보</h3>
            <span className="toggle-icon">{showLibrarySection ? '▼' : '▶'}</span>
          </div>
          
          {showLibrarySection && (
            <div className="section-content">
              <p className="section-info">문제가 발생한 라이브러리를 선택하고 버전을 입력해주세요</p>
              
              {libraryInfo.map((lib, index) => (
                <div key={lib.name} className="library-item">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id={`lib-${index}`}
                      checked={lib.hasError}
                      onChange={(e) => handleLibraryChange(index, 'hasError', e.target.checked)}
                    />
                    <label htmlFor={`lib-${index}`}>{lib.name}</label>
                  </div>
                  
                  {lib.hasError && (
                    <div className="version-input">
                      <label>버전:</label>
                      <input
                        type="text"
                        placeholder="예: 1.2.3"
                        value={lib.version}
                        onChange={(e) => handleLibraryChange(index, 'version', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <div className="external-css">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="external-css"
                    checked={hasExternalCssError}
                    onChange={(e) => setHasExternalCssError(e.target.checked)}
                  />
                  <label htmlFor="external-css">External CSS 오류</label>
                </div>
                
                {hasExternalCssError && (
                  <div className="version-input">
                    <label>CSS URL:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/styles.css"
                      value={externalCssUrl}
                      onChange={(e) => setExternalCssUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>우선순위</label>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as '높음' | '보통' | '낮음')}
          >
            <option value="높음">높음</option>
            <option value="보통">보통</option>
            <option value="낮음">낮음</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>페이지 URL</label>
          <input 
            type="text" 
            value={pageUrl} 
            onChange={(e) => setPageUrl(e.target.value)}
            readOnly={isExtensionEnv}
          />
          {isExtensionEnv && <p className="help-text">현재 페이지 URL이 자동으로 수집됩니다.</p>}
        </div>
        
        <div className="form-group">
          <label>스크린샷</label>
          {screenshot ? (
            <div className="screenshot-preview">
              <img src={screenshot} alt="페이지 스크린샷" />
            </div>
          ) : (
            <div className="no-screenshot">스크린샷이 수집되지 않았습니다.</div>
          )}
        </div>
        
        <div className="form-group">
          <label>수집된 콘솔 에러</label>
          {consoleErrors.length > 0 ? (
            <div className="console-errors">
              <ul>
                {consoleErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="no-errors">수집된 에러가 없습니다.</div>
          )}
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? '제출 중...' : 'CS 제출하기'}
        </button>
      </form>
    </div>
  );
};

export default CSForm; 