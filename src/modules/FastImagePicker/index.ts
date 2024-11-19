import { requireNativeModule } from 'expo-modules-core';
import { ImagePickerOptions, ImagePickerResult } from './types';

const FastImagePicker = requireNativeModule('FastImagePicker');

export default {
    async pickImage(options: ImagePickerOptions = {}): Promise<ImagePickerResult> {
        try {
            const result = await FastImagePicker.pickImage(options);
            return result;
        } catch (error) {
            console.error('Error picking image:', error);
            throw error;
        }
    }
};