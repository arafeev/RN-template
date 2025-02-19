import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {styles} from '../Login/LoginStyles';
import {Controller, useForm} from 'react-hook-form';
import {Button, Input} from '../../components';
import {useSignUpMutation} from '../../store/services/signUpApi';

const Register = ({navigation}) => {
  // form control
  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
  });

  // signUp mutation
  const [signUp, {isLoading, isSuccess, isError, error}] = useSignUpMutation();

  // submit form
  const onSubmit = async formData => {
    await signUp({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
    });
  };

  // redirect to login page after successful login
  useEffect(() => {
    if (isSuccess) {
      reset();
      navigation.navigate('Login');
    }
  }, [isSuccess, reset, navigation]);

  return (
    <View style={styles.container}>
      {/* first name */}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            label="First Name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g, John"
            placeholderTextColor={'#C8C8C8'}
          />
        )}
        name="first_name"
      />
      {errors.first_name && <Text>First Name is required.</Text>}

      {/* last name */}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            label="Last Name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="e.g, Doe"
            placeholderTextColor={'#C8C8C8'}
          />
        )}
        name="last_name"
      />
      {errors.last_name && <Text>Last Name is required.</Text>}

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
          {isLoading ? 'Loading...' : 'Sign Up'}
        </Text>
      </Button>

      <View style={styles.registerTextWrap}>
        <Text>
          Already have an account?{' '}
          <Text
            onPress={() => navigation.navigate('Login')}
            style={styles.registerText}>
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Register;
