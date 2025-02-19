import {configureStore} from '@reduxjs/toolkit';
import {apiSlice} from './services/apiSlice';
import {authSlice} from './slices/authSlice';

export const createStore = options =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      [authSlice.name]: authSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    ...options,
  });

export const store = createStore();
