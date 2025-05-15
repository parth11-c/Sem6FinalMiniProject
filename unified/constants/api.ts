import { Platform } from 'react-native';

const localhost = 'http://localhost:8082/api';
const androidHost = 'http://10.0.2.2:8082/api';

export const API_BASE_URL = Platform.OS === 'android' ? androidHost : localhost; 