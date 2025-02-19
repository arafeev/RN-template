import {apiSlice} from './apiSlice';
import {userLoggedIn} from '../slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const preferencesApi = apiSlice.injectEndpoints({
  endpoints: build => ({
    signIn: build.mutation({
      query: data => ({
        url: '/login',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          const {token, ...rest} = data?.response?.records || {};

          AsyncStorage.setItem('accessToken', token);
          AsyncStorage.setItem('user', JSON.stringify(rest));

          dispatch(
            userLoggedIn({
              isAuthenticated: true,
              user: {
                accessToken: token,
                ...rest,
              },
            }),
          );
        } catch {}
      },
    }),
  }),
  overrideExisting: false,
});

export const {useSignInMutation} = preferencesApi;
