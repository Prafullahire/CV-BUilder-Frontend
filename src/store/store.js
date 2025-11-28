import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cvReducer from './slices/cvSlice';
import layoutReducer from './slices/layoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cv: cvReducer,
    layout: layoutReducer,
  },
});
