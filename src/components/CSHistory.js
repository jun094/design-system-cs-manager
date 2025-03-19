import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './CSHistory.css';
const CSHistory = () => {
    const [csItems, setCsItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('전체');
    useEffect(() => {
        fetchCSHistory();
    }, []);
    const fetchCSHistory = async () => {
        setIsLoading(true);
        try {
            // 노션 데이터베이스에서 CS 히스토리 불러오기
            // 실제 구현에서는 background script를 통해 API 호출
            // 테스트 데이터
            const testData = [
                {
                    id: '1',
                    category: '버그 제보',
                    description: 'Badge 컴포넌트 사용 시 오류 발생',
                    pageUrl: 'https://example.com/admin',
                    status: '대기 중',
                    createdAt: '2023-05-10T10:30:00Z',
                    priority: '높음'
                },
                {
                    id: '2',
                    category: '사용법 문의',
                    description: 'Button 컴포넌트 사용법 문의',
                    pageUrl: 'https://example.com/dashboard',
                    status: '처리 중',
                    createdAt: '2023-05-09T14:20:00Z',
                    priority: '보통'
                },
                {
                    id: '3',
                    category: '기타',
                    description: '새 컴포넌트 추가 요청',
                    pageUrl: 'https://example.com/home',
                    status: '완료',
                    createdAt: '2023-05-08T09:15:00Z',
                    priority: '낮음'
                }
            ];
            setCsItems(testData);
        }
        catch (err) {
            setError('CS 히스토리를 불러오는 중 오류가 발생했습니다.');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getFilteredItems = () => {
        if (filter === '전체') {
            return csItems;
        }
        return csItems.filter(item => item.status === filter);
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    return (_jsxs("div", { className: "cs-history", children: [_jsxs("div", { className: "history-header", children: [_jsx("h2", { children: "CS \uD788\uC2A4\uD1A0\uB9AC" }), _jsxs("div", { className: "controls", children: [_jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), children: [_jsx("option", { value: "\uC804\uCCB4", children: "\uC804\uCCB4" }), _jsx("option", { value: "\uB300\uAE30 \uC911", children: "\uB300\uAE30 \uC911" }), _jsx("option", { value: "\uCC98\uB9AC \uC911", children: "\uCC98\uB9AC \uC911" }), _jsx("option", { value: "\uC644\uB8CC", children: "\uC644\uB8CC" })] }), _jsx("button", { onClick: fetchCSHistory, disabled: isLoading, children: isLoading ? '로딩 중...' : '새로고침' })] })] }), error && _jsx("div", { className: "error-message", children: error }), isLoading ? (_jsx("div", { className: "loading", children: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." })) : (_jsx("div", { className: "cs-list", children: getFilteredItems().length === 0 ? (_jsx("div", { className: "no-data", children: "\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (getFilteredItems().map(item => (_jsxs("div", { className: `cs-item priority-${item.priority.toLowerCase()}`, children: [_jsxs("div", { className: "item-header", children: [_jsx("div", { className: "category", children: item.category }), _jsx("div", { className: "status", children: item.status })] }), _jsx("div", { className: "description", children: item.description }), _jsxs("div", { className: "meta", children: [_jsx("div", { className: "url", title: item.pageUrl, children: item.pageUrl.length > 40 ? item.pageUrl.slice(0, 40) + '...' : item.pageUrl }), _jsx("div", { className: "date", children: formatDate(item.createdAt) })] })] }, item.id)))) }))] }));
};
export default CSHistory;
