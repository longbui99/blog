import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import RestAPI from './pages/RestAPI';
import Mission from './pages/Mission';
import RecentPosts from './pages/RecentPosts';
import PopularPosts from './pages/PopularPosts';
import Categories from './pages/Categories';
import Contact from './pages/Contact';
import './styles/styles.css'; 
import './styles/page.css'; 
import './styles/App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('isSidebarOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/restful-api" element={<RestAPI />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/recent" element={<RecentPosts />} />
            <Route path="/popular" element={<PopularPosts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </MainContent>
        <div className="toggle-container">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </Router>
  );
}

export default App;
