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
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebar } from './redux/slices/sidebarSlice';
import { setTOC } from './redux/slices/tocSlice';
import ThemeToggle from './components/ThemeToggle';
import { setLoginStatus } from './redux/slices/loginSlice';


// Initialize GA with your measurement ID
ReactGA.initialize("G-9VQG6QJLEK");

// Move the App component content to a new component
function AppContent() {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get sidebar state from Redux
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const dispatch = useDispatch();

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);

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
  }, [isDarkMode]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (loginProcessor.isLoggedIn()) {
        const isValid = await loginProcessor.validateToken();
        dispatch(setLoginStatus(isValid));
      } else {
        dispatch(setLoginStatus(false));
      }
    };

    checkLoginStatus();
  }, [dispatch]);

  // Update the resize handler to use Redux
  useEffect(() => {
    const handleResize = () => {
      handleResponsiveState({
        setSidebar: (value) => dispatch(setSidebar(value)),
        setTOC: (value) => dispatch(setTOC(value))
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const handleAddPage = () => {
    setIsEditing(true);
    setCurrentPath('/new-page'); // Set a new path for the new page
  };

  const handleLoginClick = () => {
    dispatch(setLoginStatus(true));
  };

  const handleLoginSubmit = async (username, password) => {
    const result = await loginProcessor.login(username, password);
    if (result.success) {
      dispatch(setLoginStatus(true));
    } else {
      // Handle login failure (e.g., show an error message)
      console.error(result.message);
    }
  };

  const handleLoginModalClose = () => {
    dispatch(setLoginStatus(false));
  };

  useEffect(() => {
  }, [isLoggedIn]);

  const handleMenuItemClick = () => {
    if (isDeviceMobile()) {
      dispatch(setSidebar(false));
    }
  };

  if (isLoading) {
    return <div className="loading-panel">Loading...</div>;
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
                onAddPage={handleAddPage}
              />
              <Sidebar 
                className={isDarkMode ? 'dark-mode' : ''}
                routes={routes}
                onItemClick={handleMenuItemClick}
                isLoggedIn={isLoggedIn}
              />
              <MainContent 
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
                <SidebarToggle/>
                <TOCToggle />
                <LoginToggle />
                <ThemeToggle />
              </div>
              <LoginModal 
                isOpen={isLoggedIn}
                onClose={handleLoginModalClose} 
                onSubmit={handleLoginSubmit} 
              />
            </div>
          </Router>
        </MenuProvider>
      </ConfirmationProvider>
    </NotificationProvider>
  );
}

// Main App component now just provides the Redux store
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
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
