import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRouteMap } from '../../const/routes';

export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async () => {
    const routes = await fetchRouteMap();
    return routes;
  }
);

const routesSlice = createSlice({
  name: 'routes',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    activeRoute: window.location.pathname, // Initialize with current path
    expandedItems: {},
  },
  reducers: {
    setActiveRoute: (state, action) => {
      state.activeRoute = action.payload;
    },
    updateActiveRouteFromPath: (state, action) => {
      const path = action.payload || window.location.pathname;
      // Only update if the path exists in our routes
      if (state.items.some(route => route.path === path)) {
        state.activeRoute = path;
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
        }
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setActiveRoute, updateActiveRouteFromPath, setRouteItems, updateRouteItem } = routesSlice.actions;
export default routesSlice.reducer; 