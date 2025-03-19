import React, { useState, useEffect } from 'react';
import './PriorityList.css';

type CSItem = {
  id: string;
  category: string;
  description: string;
  pageUrl: string;
  status: '대기 중' | '처리 중' | '완료';
  createdAt: string;
  priority: '높음' | '보통' | '낮음';
  position?: number;
};

const PriorityList: React.FC = () => {
  const [csItems, setCsItems] = useState<CSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_currentUser, _setCurrentUser] = useState('user123'); // 실제 구현 시 사용자 정보 가져오기
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPriorityList();
  }, []);

  const fetchPriorityList = async () => {
    setIsLoading(true);
    try {
      // 노션 데이터베이스에서 처리 대기 중인 CS 목록 불러오기
      // 실제 구현에서는 background script를 통해 API 호출
      
      // 테스트 데이터
      const testData: CSItem[] = [
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
    } catch (err) {
      setError('처리 현황을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자의 CS가 몇 번째로 처리될 예정인지 확인
  const getUserPosition = () => {
    const userItem = csItems.find(item => item.id === '2'); // 실제로는 현재 사용자의 CS를 찾아야 함
    return userItem?.position || '알 수 없음';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="priority-list">
      <div className="list-header">
        <h2>CS 처리 현황</h2>
        <button onClick={fetchPriorityList} disabled={isLoading}>
          {isLoading ? '로딩 중...' : '새로고침'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="user-position">
        내 CS는 현재 <strong>{getUserPosition()}</strong>번째로 처리될 예정입니다.
      </div>
      
      {isLoading ? (
        <div className="loading">데이터를 불러오는 중...</div>
      ) : (
        <div className="cs-queue">
          <h3>처리 대기열</h3>
          {csItems.length === 0 ? (
            <div className="no-data">처리 대기 중인 CS가 없습니다.</div>
          ) : (
            csItems.map(item => (
              <div 
                key={item.id} 
                className={`queue-item priority-${item.priority.toLowerCase()} ${item.status === '처리 중' ? 'current' : ''}`}
              >
                <div className="position">{item.position}</div>
                <div className="item-content">
                  <div className="item-header">
                    <div className="category">{item.category}</div>
                    <div className="status">{item.status}</div>
                  </div>
                  <div className="description">{item.description}</div>
                  <div className="meta">
                    <div className="date">{formatDate(item.createdAt)}</div>
                    <div className="priority">{item.priority}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PriorityList; 