import React, { useState } from 'react';
import CSForm from './components/CSForm';
import CSHistory from './components/CSHistory';
import PriorityList from './components/PriorityList';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'priority'>('form');

  return (
    <div className="app">
      <header className="header">
        <h1>디자인 시스템 CS 도우미</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'form' ? 'active' : ''} 
            onClick={() => setActiveTab('form')}
          >
            CS 등록
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            히스토리
          </button>
          <button 
            className={activeTab === 'priority' ? 'active' : ''} 
            onClick={() => setActiveTab('priority')}
          >
            처리 현황
          </button>
        </div>
      </header>

      <main className="content">
        {activeTab === 'form' && <CSForm />}
        {activeTab === 'history' && <CSHistory />}
        {activeTab === 'priority' && <PriorityList />}
      </main>
    </div>
  );
};

export default App; 