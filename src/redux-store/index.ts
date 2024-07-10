// store.js
import { configureStore } from '@reduxjs/toolkit';
import mediasReducer from './slices/mediaSlice';


const store = configureStore({
    reducer: {
        medias: mediasReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: {
            ignoredPaths: ['items.data']
        },
        serializableCheck: { ignoredPaths: ['some.nested.path'] }
    })
});

export default store;

export type RootState = ReturnType<typeof store.getState>;