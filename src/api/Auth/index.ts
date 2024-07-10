// api.js
import axios from 'axios';
import { Jwt, LoginUser } from 'src/interface';


export const login = async (credentials: LoginUser): Promise<Jwt> => {
    const { email, password } = credentials;
    // Mock API response
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'user' && password === 'password') {
                resolve({ token: '1234567890' });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 1000);
    });
};