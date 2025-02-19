import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {styles} from './LoginStyles';
import {Controller, useForm} from 'react-hook-form';
import {Button, Input} from '../../components';
import {useSignInMutation} from '../../store/services/signInApi';

const Login = ({navigation}) => {
  // form control
  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // signIn mutation
  const [signIn, {isLoading, isSuccess, isError, error}] = useSignInMutation();

  // submit form
  const onSubmit = async formData => {
    await signIn({email: formData.email, password: formData.password});
  };

  // redirect to profile page after successful login
  useEffect(() => {
    if (isSuccess) {
      reset();
      // navigation.navigate('Profile');
    }
  }, [isSuccess, reset, navigation]);

  return (
    <View style={styles.container}>
      {/* email */}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            label="Email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g, johnson@gmail.com"
            placeholderTextColor={'#C8C8C8'}
          />
        )}
        name="email"
      />
      {errors.email && <Text>Email is required.</Text>}

      {/* password */}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            label="Password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="**************"
            placeholderTextColor={'#C8C8C8'}
          />
        )}
        name="password"
      />
      {errors.password && <Text>Password is required.</Text>}

      {/* login error */}
      {isError && (
        <View style={styles.loginError}>
          <Text style={styles.forgotPassword}>
            {error?.error ?? 'An error occurred'}
          </Text>
        </View>
      )}

      <Button style={styles.loginBtn} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.loginText}>
          {isLoading ? 'Loading...' : 'Login'}
        </Text>
      </Button>

      <View style={styles.registerTextWrap}>
        <Text>
          Don't have an account?{' '}
          <Text
            onPress={() => navigation.navigate('Register')}
            style={styles.registerText}>
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Login;
