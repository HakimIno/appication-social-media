// utils/config.ts
import { Platform } from 'react-native';
import {
    APP_VARIANT,
    API_URL,
    APP_NAME,
    ENVIRONMENT,
    DEBUG,
    API_TIMEOUT,
} from '@env';

export const config = {
    apiUrl: API_URL,
    appName: APP_NAME,
    environment: ENVIRONMENT,
    isProduction: ENVIRONMENT === 'production',
    isDevelopment: ENVIRONMENT === 'development',
    isPreview: ENVIRONMENT === 'preview',
    debug: DEBUG === 'true',
    apiTimeout: parseInt(API_TIMEOUT, 10),
    platform: Platform.OS,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
};