import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupMockChromeApi } from './utils/mockChromeApi';

// 개발 환경에서 모의 크롬 API 설정
if (import.meta.env.DEV) {
  setupMockChromeApi();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 