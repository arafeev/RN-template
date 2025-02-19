import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
  },
  logoutBtn: {
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  logout: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    margin: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  email: {
    marginTop: 5,
    fontSize: 12,
    color: '#2C2C2C',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
