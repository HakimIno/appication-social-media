// env.d.ts
declare module '@env' {
    export const APP_VARIANT: 'development' | 'preview' | 'production';
    export const API_URL: string;
    export const APP_NAME: string;
    export const ENVIRONMENT: string;
    export const DEBUG: string;
    export const API_TIMEOUT: string;
}