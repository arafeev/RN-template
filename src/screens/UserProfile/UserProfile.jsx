import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, Text, Image} from 'react-native';
import {styles} from './UserProfileStyle';
import {Button} from '../../components';
import {userLoggedOut} from '../../store/slices/authSlice';

const UserProfile = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth) || {};
  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          dispatch(userLoggedOut());
        }}
        style={styles.logoutBtn}>
        <Text style={styles.logout}>Logout</Text>
      </Button>
      <View style={styles.card}>
        <Image
          style={styles.userImage}
          source={{
            uri: user?.picture || 'https://via.placeholder.com/150',
          }}
        />
        <View>
          <Text style={styles.name}>ID: {user?.user_id}</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>
    </View>
  );
};

export default UserProfile;
