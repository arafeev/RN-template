import React from 'react';
import {View, Image} from 'react-native';
import {styles} from './AuthCheckingUiStyle';

const AuthCheckingUi = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../../assets/images/launch_screen.png')}
      />
    </View>
  );
};

export default AuthCheckingUi;
