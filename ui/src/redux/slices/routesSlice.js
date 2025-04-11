import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRouteMap, checkNewRoute, markRouteAsViewed } from '../../const/routes';

export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async () => {
    const routes = await fetchRouteMap();
    checkNewRoute(routes);
    return routes;
  }
);

// Helper function to handle marking route as viewed
const markRouteAsViewedAndUpdateState = (state, path) => {
  // Find the route and check if it's new
  const activeRoute = state.items.find(route => route.path === path);
  if (activeRoute && activeRoute.isNew) {
    // Call the localStorage function
    markRouteAsViewed(path);
  }
};

const routesSlice = createSlice({
  name: 'routes',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    activeRoute: window.location.pathname,
    expandedItems: {},
  },
  reducers: {
    setActiveRoute: (state, action) => {
      const path = action.payload;
      state.activeRoute = path;
      
      // Mark as viewed in localStorage and update state
      markRouteAsViewedAndUpdateState(state, path);
    },
    updateActiveRouteFromPath: (state, action) => {
      const path = action.payload || window.location.pathname;
      // Only update if the path exists in our routes
      if (state.items.some(route => route.path === path)) {
        state.activeRoute = path;
        
        // Mark as viewed in localStorage and update state
        markRouteAsViewedAndUpdateState(state, path);
      }
    },
    setRouteItems: (state, action) => {
      state.items = action.payload;
    },
    updateRouteItem: (state, action) => {
      const index = state.items.findIndex(route => route.path === action.payload.path);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setExpandedItems: (state, action) => {
      state.expandedItems = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
        // Set active route after routes are loaded
        const currentPath = window.location.pathname;
        if (action.payload.some(route => route.path === currentPath)) {
          state.activeRoute = currentPath;
          
          // Mark the initial route as viewed
          markRouteAsViewedAndUpdateState(state, currentPath);
        }
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setActiveRoute, updateActiveRouteFromPath, setRouteItems, updateRouteItem, setExpandedItems } = routesSlice.actions;
export default routesSlice.reducer; 