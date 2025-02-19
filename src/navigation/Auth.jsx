import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import useAuth from '../hooks/useAuth';
import {Login, Register, UserProfile} from '../screens';

const Stack = createStackNavigator();

const Authentication = () => {
  const isLoggedIn = useAuth();

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <Stack.Screen name="Profile" component={UserProfile} />
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Authentication;
