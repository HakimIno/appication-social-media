import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as MediaLibrary from 'expo-media-library';

interface PhotoState {
    loading: boolean;
    photos: MediaLibrary.Asset[];
    videos: MediaLibrary.Asset[];
    allFiles: MediaLibrary.Asset[];
    albumsInfo: { title: string; url: string; assetCount: number }[];
    selectAlbums: { title: string; indx: number }
}

const initialState: PhotoState = {
    loading: false,
    photos: [],
    videos: [],
    allFiles: [],
    albumsInfo: [],
    selectAlbums: {
        title: 'Photos',
        indx: 0
    }
};

const mediasSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setPhotos: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.photos = action.payload;
        },
        setVideos: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.videos = action.payload;
        },
        setAllFiles: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.allFiles = action.payload;
        },
        setAlbumsInfo: (state, action: PayloadAction<{ title: string; url: string; assetCount: number }[]>) => {
            state.albumsInfo = action.payload;
        },
        setSelectAlbums: (state, action: PayloadAction<{ title: string; indx: number }>) => {
            state.selectAlbums = action.payload;
        },
    },
});

export const { setLoading, setPhotos, setVideos, setAllFiles, setAlbumsInfo, setSelectAlbums } = mediasSlice.actions;
export default mediasSlice.reducer;
