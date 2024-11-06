import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from "react-ga4";
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TOCToggle from './components/TOCToggle';
import SidebarToggle from './components/SidebarToggle';
import LoginToggle from './components/LoginToggle';
import LoginModal from './components/LoginModal';
import './styles/styles.css'; 
import './styles/page.css'; 
import './styles/App.css';
import './styles/Toggle.css';
import { fetchRouteMap } from './const/routes';
import { loginProcessor } from './processor/loginProcessor';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { MenuProvider } from './contexts/MenuContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { initializeBaseProcessor } from './processor/baseProcessor';
import { getInitialPanelState, handleResponsiveState, isDeviceMobile } from './utils/responsive';


// Initialize GA with your measurement ID
ReactGA.initialize("G-9VQG6QJLEK");

function App() {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('isSidebarOpen');
    return saved !== null ? JSON.parse(saved) : getInitialPanelState();
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
    return saved !== null ? JSON.parse(saved) : getInitialPanelState();
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isCurrentlyLoggedIn = loginProcessor.isLoggedIn();
      
      if (isCurrentlyLoggedIn) {
        // Validate token if user appears to be logged in
        const isValid = await loginProcessor.validateToken();
        if (!isValid) {
          // Token is invalid, redirect to login
          setIsLoggedIn(false);
          setIsLoginModalOpen(true);
        } else {
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []); // Run on component mount

  useEffect(() => {
    const handleResize = () => {
      handleResponsiveState({
        setSidebar: setIsSidebarOpen,
        setTOC: setIsTOCOpen
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setIsLoginModalOpen(true);
  };

  const handleLoginSubmit = async (username, password) => {
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
  }, [isLoginModalOpen, isLoginPopup]);

  const handleMenuItemClick = () => {
    if (isDeviceMobile()) {
      setIsSidebarOpen(false);
    }
  };

  if (isLoading) {
    return <div class="loading-panel">Loading...</div>;
  }

  const handleRoutesUpdate = (updatedRoutes) => {
    setRoutes(updatedRoutes);
  };

  return (
    <NotificationProvider>
      <ProcessorInitializer />
      <ConfirmationProvider>
      <MenuProvider>
        <Router>
          <RouteTracker />
          <div className="App">
            <Header 
              isLoggedIn={isLoggedIn} 
              onAddPage={handleAddPage}/>
            <Sidebar 
              isOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
              className={isDarkMode ? 'dark-mode' : ''}
              routes={routes}
              onItemClick={handleMenuItemClick}
              isLoggedIn={isLoggedIn}
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
              setIsTOCOpen={setIsTOCOpen}
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
              isLoggedIn={isLoggedIn}
            />
          </div>
        </Router></MenuProvider>
      </ConfirmationProvider>
    </NotificationProvider>
  );
}

// Create a separate component for route tracking
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
}

// Create a new component to handle the initialization
function ProcessorInitializer() {
  const { showNotification } = useNotification();

  useEffect(() => {
    initializeBaseProcessor(showNotification);
  }, [showNotification]);

  return null;
}

export default App;
