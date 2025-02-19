import {apiSlice} from './apiSlice';

export const preferencesApi = apiSlice.injectEndpoints({
  endpoints: build => ({
    signUp: build.mutation({
      query: data => ({
        url: '/registration',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {useSignUpMutation} = preferencesApi;
