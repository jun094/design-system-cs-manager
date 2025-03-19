import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { isChromeExtension, safeTabsQuery, safeCaptureVisibleTab, safeExecuteScript } from '../utils/chromeUtils';
import './CSForm.css';
const LIBRARIES = [
    '@goorm-dev/vapor-core',
    '@goorm-dev/vapor-components',
    '@goorm-dev/vapor-tables',
    '@goorm-dev/vapor-charts'
];
const CSForm = () => {
    const [category, setCategory] = useState('버그 제보');
    const [description, setDescription] = useState('');
    const [pageUrl, setPageUrl] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [consoleErrors, setConsoleErrors] = useState([]);
    const [priority, setPriority] = useState('보통');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isExtensionEnv, setIsExtensionEnv] = useState(false);
    // 라이브러리 정보 상태 추가
    const [libraryInfo, setLibraryInfo] = useState(LIBRARIES.map(name => ({ name, version: '', hasError: false })));
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
            }
            catch (error) {
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
                if (!tabs.length || !tabs[0].id)
                    return;
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
                        setLibraryInfo(prev => prev.map(lib => ({
                            ...lib,
                            hasError: errorText.includes(lib.name)
                        })));
                    }
                    // 외부 CSS 오류 확인
                    if (errorText.includes('CSS') || errorText.includes('stylesheet')) {
                        setHasExternalCssError(true);
                        setShowLibrarySection(true);
                    }
                }
            }
            catch (error) {
                console.error('캡처 실패:', error);
            }
        };
        if (isExtensionEnv) {
            captureScreenshot();
        }
    }, [isExtensionEnv]);
    // 콘솔 에러 수집 함수 (웹페이지에서 실행됨)
    const collectConsoleErrors = () => {
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
    const handleLibraryChange = (index, field, value) => {
        const newLibraryInfo = [...libraryInfo];
        newLibraryInfo[index] = {
            ...newLibraryInfo[index],
            [field]: value
        };
        setLibraryInfo(newLibraryInfo);
    };
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            setMessage('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const sendToSlack = async () => {
        // 슬랙 API 호출 로직
        // 실제 구현 시에는 background script를 통해 API 호출
        if (!isExtensionEnv)
            return;
        // 테스트를 위한 더미 응답
        return new Promise(resolve => setTimeout(resolve, 500));
    };
    const saveToNotion = async () => {
        // 노션 API 호출 로직
        // 실제 구현 시에는 background script를 통해 API 호출
        if (!isExtensionEnv)
            return;
        // 테스트를 위한 더미 응답
        return new Promise(resolve => setTimeout(resolve, 500));
    };
    return (_jsxs("div", { className: "cs-form", children: [_jsx("h2", { children: "CS \uB4F1\uB85D\uD558\uAE30" }), message && _jsx("div", { className: "message", children: message }), !isExtensionEnv && (_jsx("div", { className: "warning-message", children: "\uD604\uC7AC \uBE0C\uB77C\uC6B0\uC800 \uD658\uACBD\uC5D0\uC11C\uB294 \uC2A4\uD06C\uB9B0\uC0F7\uACFC \uCF58\uC194 \uC5D0\uB7EC \uC218\uC9D1\uC774 \uC81C\uD55C\uB429\uB2C8\uB2E4." })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uCE74\uD14C\uACE0\uB9AC" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { value: "\uBC84\uADF8 \uC81C\uBCF4", children: "\uBC84\uADF8 \uC81C\uBCF4" }), _jsx("option", { value: "\uC0AC\uC6A9\uBC95 \uBB38\uC758", children: "\uC0AC\uC6A9\uBC95 \uBB38\uC758" }), _jsx("option", { value: "\uAE30\uD0C0", children: "\uAE30\uD0C0" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uC124\uBA85" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), required: true })] }), _jsxs("div", { className: "form-section", children: [_jsxs("div", { className: "section-header", onClick: () => setShowLibrarySection(!showLibrarySection), children: [_jsx("h3", { children: "\uB77C\uC774\uBE0C\uB7EC\uB9AC \uC815\uBCF4" }), _jsx("span", { className: "toggle-icon", children: showLibrarySection ? '▼' : '▶' })] }), showLibrarySection && (_jsxs("div", { className: "section-content", children: [_jsx("p", { className: "section-info", children: "\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD55C \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uC120\uD0DD\uD558\uACE0 \uBC84\uC804\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694" }), libraryInfo.map((lib, index) => (_jsxs("div", { className: "library-item", children: [_jsxs("div", { className: "form-check", children: [_jsx("input", { type: "checkbox", id: `lib-${index}`, checked: lib.hasError, onChange: (e) => handleLibraryChange(index, 'hasError', e.target.checked) }), _jsx("label", { htmlFor: `lib-${index}`, children: lib.name })] }), lib.hasError && (_jsxs("div", { className: "version-input", children: [_jsx("label", { children: "\uBC84\uC804:" }), _jsx("input", { type: "text", placeholder: "\uC608: 1.2.3", value: lib.version, onChange: (e) => handleLibraryChange(index, 'version', e.target.value) })] }))] }, lib.name))), _jsxs("div", { className: "external-css", children: [_jsxs("div", { className: "form-check", children: [_jsx("input", { type: "checkbox", id: "external-css", checked: hasExternalCssError, onChange: (e) => setHasExternalCssError(e.target.checked) }), _jsx("label", { htmlFor: "external-css", children: "External CSS \uC624\uB958" })] }), hasExternalCssError && (_jsxs("div", { className: "version-input", children: [_jsx("label", { children: "CSS URL:" }), _jsx("input", { type: "text", placeholder: "https://example.com/styles.css", value: externalCssUrl, onChange: (e) => setExternalCssUrl(e.target.value) })] }))] })] }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uC6B0\uC120\uC21C\uC704" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), children: [_jsx("option", { value: "\uB192\uC74C", children: "\uB192\uC74C" }), _jsx("option", { value: "\uBCF4\uD1B5", children: "\uBCF4\uD1B5" }), _jsx("option", { value: "\uB0AE\uC74C", children: "\uB0AE\uC74C" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uD398\uC774\uC9C0 URL" }), _jsx("input", { type: "text", value: pageUrl, onChange: (e) => setPageUrl(e.target.value), readOnly: isExtensionEnv }), isExtensionEnv && _jsx("p", { className: "help-text", children: "\uD604\uC7AC \uD398\uC774\uC9C0 URL\uC774 \uC790\uB3D9\uC73C\uB85C \uC218\uC9D1\uB429\uB2C8\uB2E4." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uC2A4\uD06C\uB9B0\uC0F7" }), screenshot ? (_jsx("div", { className: "screenshot-preview", children: _jsx("img", { src: screenshot, alt: "\uD398\uC774\uC9C0 \uC2A4\uD06C\uB9B0\uC0F7" }) })) : (_jsx("div", { className: "no-screenshot", children: "\uC2A4\uD06C\uB9B0\uC0F7\uC774 \uC218\uC9D1\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4." }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\uC218\uC9D1\uB41C \uCF58\uC194 \uC5D0\uB7EC" }), consoleErrors.length > 0 ? (_jsx("div", { className: "console-errors", children: _jsx("ul", { children: consoleErrors.map((error, index) => (_jsx("li", { children: error }, index))) }) })) : (_jsx("div", { className: "no-errors", children: "\uC218\uC9D1\uB41C \uC5D0\uB7EC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." }))] }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? '제출 중...' : 'CS 제출하기' })] })] }));
};
export default CSForm;
