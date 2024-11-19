import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as MediaLibrary from 'expo-media-library';

interface PhotoState {
    loading: boolean;
    photos: MediaLibrary.Asset[];
    videos: MediaLibrary.Asset[];
    allFiles: MediaLibrary.Asset[];
    albumsInfo: { title: string; url: string; assetCount: number }[];
    selectAlbums: { title: string; indx: number };
    selectedPhotos: MediaLibrary.Asset[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string | undefined;
    };
    pageSize: number;
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
    },
    selectedPhotos: [],
    pageInfo: {
        hasNextPage: true,
        endCursor: undefined
    },
    pageSize: 15
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
        appendPhotos: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.photos = [...state.photos, ...action.payload];
        },
        setVideos: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.videos = action.payload;
        },
        appendVideos: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.videos = [...state.videos, ...action.payload];
        },
        setAllFiles: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.allFiles = action.payload;
        },
        appendAllFiles: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.allFiles = [...state.allFiles, ...action.payload];
        },
        setAlbumsInfo: (state, action: PayloadAction<{ title: string; url: string; assetCount: number }[]>) => {
            state.albumsInfo = action.payload;
        },
        setSelectAlbums: (state, action: PayloadAction<{ title: string; indx: number }>) => {
            state.selectAlbums = action.payload;
            // Reset pagination when changing albums
            state.pageInfo = {
                hasNextPage: true,
                endCursor: undefined
            };
            state.photos = [];
            state.videos = [];
            state.allFiles = [];
        },
        setSelectPhotos: (state, action: PayloadAction<MediaLibrary.Asset[]>) => {
            state.selectedPhotos = action.payload;
        },
        setPageInfo: (state, action: PayloadAction<{ hasNextPage: boolean; endCursor: string | undefined }>) => {
            state.pageInfo = action.payload;
        },
    },
});

export const {
    setLoading,
    setPhotos,
    appendPhotos,
    setVideos,
    appendVideos,
    setAllFiles,
    appendAllFiles,
    setAlbumsInfo,
    setSelectAlbums,
    setSelectPhotos,
    setPageInfo
} = mediasSlice.actions;

export default mediasSlice.reducer;