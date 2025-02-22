import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ReactGA from "react-ga4";
import Header from './components/navbar/Header';
import Sidebar from './components/sidebar/Sidebar';
import MainContent from './components/blog_pages/MainContent';
import LoginModal from './components/navbar/LoginModal';
import { NotificationProvider } from './contexts/NotificationContext';
import { MenuProvider } from './contexts/MenuContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { loginProcessor } from './processor/loginProcessor';
import { initializeBaseProcessor } from './processor/baseProcessor';
import { handleResponsiveState, isDeviceMobile } from './utils/responsive';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { setLoginStatus } from './redux/slices/loginSlice';
import { setSidebar } from './redux/slices/sidebarSlice';
import { setTOC } from './redux/slices/tocSlice';
import { fetchRoutes } from './redux/slices/routesSlice';
import './App.css';

// Initialize GA
ReactGA.initialize("G-9VQG6QJLEK");

function AppContent() {
  const dispatch = useDispatch();
  const { items: routesRedux, isLoading: routesLoading, error: routesError } = useSelector((state) => state.routes);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);

  // Initialize theme on app load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, []); // Run once on mount

  // Load routes
  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  // Check login status
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

  // Handle responsive state
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

  if (routesLoading) {
    return <div className="loading-panel">Loading...</div>;
  }

  if (routesError) {
    return <div className="error-panel">Error loading routes: {routesError}</div>;
  }

  return (
    <NotificationProvider>
      <ProcessorInitializer />
      <ConfirmationProvider>
        <MenuProvider>
          <Router>
            <RouteTracker />
            <div className="App">
              <Header isLoggedIn={isLoggedIn} />
              <Sidebar 
              />
              <MainContent >
                <Routes>
                  {routesRedux.map(route => (
                    <Route key={route.path} path={route.path} element={<route.component />} />
                  ))}
                </Routes>
              </MainContent>
              <LoginModal />
            </div>
          </Router>
        </MenuProvider>
      </ConfirmationProvider>
    </NotificationProvider>
  );
}

// Route tracking component
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
}

// Processor initialization component
function ProcessorInitializer() {
  useEffect(() => {
    initializeBaseProcessor();
  }, []);

  return null;
}

// Main App component
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
