import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TOCToggle from './components/TOCToggle';
import SidebarToggle from './components/SidebarToggle';
import LoginToggle from './components/LoginToggle';
import LoginModal from './components/LoginModal';
import EditPageContent from './components/EditPageContent';
import './styles/styles.css'; 
import './styles/page.css'; 
import './styles/App.css';
import './styles/Toggle.css';
import { fetchRouteMap } from './const/routes';
import { loginProcessor } from './processor/loginProcessor';
import { v4 as uuidv4 } from 'uuid';


function App() {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('isSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isTOCOpen, setIsTOCOpen] = useState(() => {
    const saved = localStorage.getItem('isTOCOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(loginProcessor.isLoggedIn());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginPopup, setIsLoginPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');


  useEffect(() => {
    const loadRoutes = async () => {
      setIsLoading(true);
      const fetchedRoutes = await fetchRouteMap();
      setRoutes(fetchedRoutes);
      setIsLoading(false);
    };

    loadRoutes();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('isTOCOpen', JSON.stringify(isTOCOpen));
  }, [isTOCOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleTOC = () => {
    setIsTOCOpen(!isTOCOpen);
  };

  const handleAddPage = () => {
    setIsEditing(true);
    setCurrentPath('/new-page'); // Set a new path for the new page
  };

  const handleLoginClick = () => {
    console.log('Login button clicked');
    if (isLoggedIn) {
      // Handle logout
      const result = loginProcessor.logout();
      if (result.success) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoginModalOpen(true);
      setIsLoginPopup(true);
    }
  };

  const handleLoginSubmit = async (username, password) => {
    console.log('Login submitted:', username, password);
    const result = await loginProcessor.login(username, password);
    if (result.success) {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
    } else {
      // Handle login failure (e.g., show an error message)
      console.error(result.message);
    }
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    setIsLoginPopup(false);
  };

  useEffect(() => {
    console.log('App rendered. isLoginModalOpen:', isLoginModalOpen, 'isLoginPopup:', isLoginPopup);
  }, [isLoginModalOpen, isLoginPopup]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleRoutesUpdate = (updatedRoutes) => {
    setRoutes(updatedRoutes);
  };

  return (
    <Router>
      <div className="App">
        <Header 
          isLoggedIn={isLoggedIn} 
          onAddPage={handleAddPage}/>
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          className={isDarkMode ? 'dark-mode' : ''}
          routes={routes}
        />
        <MainContent 
          isSidebarOpen={isSidebarOpen} 
          isTOCOpen={isTOCOpen}
          isLoggedIn={isLoggedIn}
          routes={routes}
          onRoutesUpdate={handleRoutesUpdate}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
        >
          <Routes>
            {routes.map(route => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Routes>
        </MainContent>
        <div className="toggle-container">
          <SidebarToggle isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <TOCToggle isOpen={isTOCOpen} toggleTOC={toggleTOC} />
          <LoginToggle isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick} />
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={handleLoginModalClose} 
          onSubmit={handleLoginSubmit} 
          isPopup={isLoginPopup}
        />
      </div>
    </Router>
  );
}

export default App;
