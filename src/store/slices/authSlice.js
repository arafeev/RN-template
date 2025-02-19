import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      const {isAuthenticated, user} = action.payload;
      state.isAuthenticated = isAuthenticated;
      state.user = user;
    },
    userLoggedOut: state => {
      state.isAuthenticated = false;
      state.user = null;
      AsyncStorage.removeItem('accessToken');
      AsyncStorage.removeItem('user');
    },
  },
});

export const {userLoggedIn, userLoggedOut} = authSlice.actions;

export default authSlice.reducer;
