import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import CSForm from './components/CSForm';
import CSHistory from './components/CSHistory';
import PriorityList from './components/PriorityList';
import './App.css';
const App = () => {
    const [activeTab, setActiveTab] = useState('form');
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "header", children: [_jsx("h1", { children: "\uB514\uC790\uC778 \uC2DC\uC2A4\uD15C CS \uB3C4\uC6B0\uBBF8" }), _jsxs("div", { className: "tabs", children: [_jsx("button", { className: activeTab === 'form' ? 'active' : '', onClick: () => setActiveTab('form'), children: "CS \uB4F1\uB85D" }), _jsx("button", { className: activeTab === 'history' ? 'active' : '', onClick: () => setActiveTab('history'), children: "\uD788\uC2A4\uD1A0\uB9AC" }), _jsx("button", { className: activeTab === 'priority' ? 'active' : '', onClick: () => setActiveTab('priority'), children: "\uCC98\uB9AC \uD604\uD669" })] })] }), _jsxs("main", { className: "content", children: [activeTab === 'form' && _jsx(CSForm, {}), activeTab === 'history' && _jsx(CSHistory, {}), activeTab === 'priority' && _jsx(PriorityList, {})] })] }));
};
export default App;
