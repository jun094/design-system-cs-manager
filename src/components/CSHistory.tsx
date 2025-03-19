import React, { useState, useEffect } from 'react';
import './CSHistory.css';

type CSItem = {
  id: string;
  category: string;
  description: string;
  pageUrl: string;
  status: '대기 중' | '처리 중' | '완료';
  createdAt: string;
  priority: '높음' | '보통' | '낮음';
};

const CSHistory: React.FC = () => {
  const [csItems, setCsItems] = useState<CSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'전체' | '대기 중' | '처리 중' | '완료'>('전체');

  useEffect(() => {
    fetchCSHistory();
  }, []);

  const fetchCSHistory = async () => {
    setIsLoading(true);
    try {
      // 노션 데이터베이스에서 CS 히스토리 불러오기
      // 실제 구현에서는 background script를 통해 API 호출
      
      // 테스트 데이터
      const testData: CSItem[] = [
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
    } catch (err) {
      setError('CS 히스토리를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (filter === '전체') {
      return csItems;
    }
    return csItems.filter(item => item.status === filter);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="cs-history">
      <div className="history-header">
        <h2>CS 히스토리</h2>
        <div className="controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="전체">전체</option>
            <option value="대기 중">대기 중</option>
            <option value="처리 중">처리 중</option>
            <option value="완료">완료</option>
          </select>
          <button onClick={fetchCSHistory} disabled={isLoading}>
            {isLoading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading">데이터를 불러오는 중...</div>
      ) : (
        <div className="cs-list">
          {getFilteredItems().length === 0 ? (
            <div className="no-data">데이터가 없습니다.</div>
          ) : (
            getFilteredItems().map(item => (
              <div key={item.id} className={`cs-item priority-${item.priority.toLowerCase()}`}>
                <div className="item-header">
                  <div className="category">{item.category}</div>
                  <div className="status">{item.status}</div>
                </div>
                <div className="description">{item.description}</div>
                <div className="meta">
                  <div className="url" title={item.pageUrl}>
                    {item.pageUrl.length > 40 ? item.pageUrl.slice(0, 40) + '...' : item.pageUrl}
                  </div>
                  <div className="date">{formatDate(item.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CSHistory; 