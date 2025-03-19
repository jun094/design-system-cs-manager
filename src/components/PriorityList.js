import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './PriorityList.css';
const PriorityList = () => {
    const [csItems, setCsItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [_currentUser, _setCurrentUser] = useState('user123'); // 실제 구현 시 사용자 정보 가져오기
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchPriorityList();
    }, []);
    const fetchPriorityList = async () => {
        setIsLoading(true);
        try {
            // 노션 데이터베이스에서 처리 대기 중인 CS 목록 불러오기
            // 실제 구현에서는 background script를 통해 API 호출
            // 테스트 데이터
            const testData = [
                {
                    id: '1',
                    category: '버그 제보',
                    description: 'Badge 컴포넌트 사용 시 오류 발생',
                    pageUrl: 'https://example.com/admin',
                    status: '처리 중',
                    createdAt: '2023-05-10T10:30:00Z',
                    priority: '높음',
                    position: 1
                },
                {
                    id: '2',
                    category: '사용법 문의',
                    description: 'Button 컴포넌트 사용법 문의',
                    pageUrl: 'https://example.com/dashboard',
                    status: '대기 중',
                    createdAt: '2023-05-09T14:20:00Z',
                    priority: '보통',
                    position: 2
                },
                {
                    id: '3',
                    category: '버그 제보',
                    description: 'Table 컴포넌트 정렬 기능 오류',
                    pageUrl: 'https://example.com/users',
                    status: '대기 중',
                    createdAt: '2023-05-11T09:45:00Z',
                    priority: '높음',
                    position: 3
                },
                {
                    id: '4',
                    category: '기타',
                    description: '새 컴포넌트 추가 요청',
                    pageUrl: 'https://example.com/home',
                    status: '대기 중',
                    createdAt: '2023-05-08T09:15:00Z',
                    priority: '낮음',
                    position: 4
                }
            ];
            setCsItems(testData);
        }
        catch (err) {
            setError('처리 현황을 불러오는 중 오류가 발생했습니다.');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    // 사용자의 CS가 몇 번째로 처리될 예정인지 확인
    const getUserPosition = () => {
        const userItem = csItems.find(item => item.id === '2'); // 실제로는 현재 사용자의 CS를 찾아야 함
        return userItem?.position || '알 수 없음';
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    return (_jsxs("div", { className: "priority-list", children: [_jsxs("div", { className: "list-header", children: [_jsx("h2", { children: "CS \uCC98\uB9AC \uD604\uD669" }), _jsx("button", { onClick: fetchPriorityList, disabled: isLoading, children: isLoading ? '로딩 중...' : '새로고침' })] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "user-position", children: ["\uB0B4 CS\uB294 \uD604\uC7AC ", _jsx("strong", { children: getUserPosition() }), "\uBC88\uC9F8\uB85C \uCC98\uB9AC\uB420 \uC608\uC815\uC785\uB2C8\uB2E4."] }), isLoading ? (_jsx("div", { className: "loading", children: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." })) : (_jsxs("div", { className: "cs-queue", children: [_jsx("h3", { children: "\uCC98\uB9AC \uB300\uAE30\uC5F4" }), csItems.length === 0 ? (_jsx("div", { className: "no-data", children: "\uCC98\uB9AC \uB300\uAE30 \uC911\uC778 CS\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (csItems.map(item => (_jsxs("div", { className: `queue-item priority-${item.priority.toLowerCase()} ${item.status === '처리 중' ? 'current' : ''}`, children: [_jsx("div", { className: "position", children: item.position }), _jsxs("div", { className: "item-content", children: [_jsxs("div", { className: "item-header", children: [_jsx("div", { className: "category", children: item.category }), _jsx("div", { className: "status", children: item.status })] }), _jsx("div", { className: "description", children: item.description }), _jsxs("div", { className: "meta", children: [_jsx("div", { className: "date", children: formatDate(item.createdAt) }), _jsx("div", { className: "priority", children: item.priority })] })] })] }, item.id))))] }))] }));
};
export default PriorityList;
