import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {userLoggedIn} from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAuthCheck() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const user = accessToken
        ? JSON.parse(await AsyncStorage.getItem('user'))
        : null;

      if (accessToken && user) {
        dispatch(
          userLoggedIn({
            isAuthenticated: true,
            user: {
              accessToken: accessToken,
              ...user,
            },
          }),
        );
      }

      setAuthChecked(true);
    })();
  }, [dispatch, setAuthChecked]);

  return authChecked;
}
