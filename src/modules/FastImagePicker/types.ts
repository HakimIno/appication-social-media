export interface ImagePickerOptions {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
    mediaTypes?: 'Images' | 'Videos' | 'All';
    exif?: boolean;
}

export interface ImagePickerResult {
    cancelled: boolean;
    uri?: string;
    width?: number;
    height?: number;
    type?: string;
    exif?: any;
}