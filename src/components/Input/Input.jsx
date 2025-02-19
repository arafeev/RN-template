import React from 'react';
import {styles} from './InputStyle';
import {Text, TextInput, View} from 'react-native';

const Input = ({label, ...props}) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
};

export default Input;
