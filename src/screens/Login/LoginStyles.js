import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  registerTextWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: 'blue',
  },
  loginBtn: {
    marginTop: 20,
    backgroundColor: '#FCCA19',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    height: 50,
    borderRadius: 10,
  },
  loginText: {
    color: '#333025',
    fontWeight: 'bold',
    fontSize: 20,
  },
  loginError: {
    marginTop: 20,
    color: '#E43147',
  },
});
