import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux-store';
import {
    setLoading,
    setPhotos,
    appendPhotos,
    setVideos,
    appendVideos,
    setAllFiles,
    appendAllFiles,
    setAlbumsInfo,
    setSelectAlbums,
    setPageInfo
} from '../../../../redux-store/slices/mediaSlice';
import * as MediaLibrary from 'expo-media-library';

export const useCreateScreen = () => {
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.medias.loading);
    const photos = useSelector((state: RootState) => state.medias.photos);
    const videos = useSelector((state: RootState) => state.medias.videos);
    const allFiles = useSelector((state: RootState) => state.medias.allFiles);
    const albumsInfo = useSelector((state: RootState) => state.medias.albumsInfo);
    const selectAlbums = useSelector((state: RootState) => state.medias.selectAlbums);
    const pageInfo = useSelector((state: RootState) => state.medias.pageInfo);
    const pageSize = useSelector((state: RootState) => state.medias.pageSize);

    const loadPhotos = async (isInitial = true) => {
        try {
            dispatch(setLoading(true));

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access media library denied');
                return;
            }

            const options = {
                first: pageSize,
                after: isInitial ? undefined : pageInfo.endCursor,
                sortBy: [MediaLibrary.SortBy.creationTime],
                sortOrder: 'desc'
            };

            const getAlbum = await MediaLibrary.getAlbumAsync(selectAlbums.title);

            // Load photos and videos concurrently
            const [photosResponse, videosResponse] = await Promise.all([
                MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.photo,
                    album: getAlbum,
                    ...options,
                }),
                MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.video,
                    album: getAlbum,
                    ...options,
                })
            ]);

            // Combine and sort assets
            const newAssets = [...photosResponse.assets, ...videosResponse.assets]
                .sort((a, b) => b.creationTime - a.creationTime);

            // Update pagination info
            dispatch(setPageInfo({
                hasNextPage: photosResponse.hasNextPage || videosResponse.hasNextPage,
                endCursor: photosResponse.endCursor || videosResponse.endCursor
            }));

            // Filter and update media arrays
            const newPhotos = newAssets.filter(asset => asset.mediaType === MediaLibrary.MediaType.photo);
            const newVideos = newAssets.filter(asset => asset.mediaType === MediaLibrary.MediaType.video);

            if (isInitial) {
                dispatch(setPhotos(newPhotos));
                dispatch(setVideos(newVideos));
                dispatch(setAllFiles(newAssets));
            } else {
                dispatch(appendPhotos(newPhotos));
                dispatch(appendVideos(newVideos));
                dispatch(appendAllFiles(newAssets));
            }

            // Load albums info only on initial load
            if (isInitial) {
                const albumsResponse = await MediaLibrary.getAlbumsAsync();
                const albumsInfoArray = await Promise.all(
                    albumsResponse
                        .filter(album => album.assetCount > 0)
                        .map(async album => {
                            const albumOptions = {
                                first: 1,
                                album: album.id,
                                mediaType: MediaLibrary.MediaType.photo,
                                sortBy: [MediaLibrary.SortBy.creationTime],
                                sortOrder: "desc",
                            };

                            const { assets } = await MediaLibrary.getAssetsAsync(albumOptions);
                            const firstAsset = assets.find(item => item.albumId === album.id);

                            return firstAsset ? {
                                title: album.title,
                                url: firstAsset.uri,
                                assetCount: album.assetCount,
                            } : null;
                        })
                );

                const validAlbumsInfoArray = albumsInfoArray.filter((album): album is { title: string; url: string; assetCount: number } => album !== null);
                dispatch(setAlbumsInfo(validAlbumsInfoArray.sort((a, b) => b.assetCount - a.assetCount)));
            }

        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const loadMore = async () => {
        if (pageInfo.hasNextPage && !loading) {
            await loadPhotos(false);
        }
    };

    const handelSelectAlbums = (title: string, indx: number) => {
        dispatch(setSelectAlbums({ title, indx }));
    };

    useEffect(() => {
        if (selectAlbums.title) {
            loadPhotos(true);
        }
    }, [selectAlbums]);

    return {
        loading,
        photos,
        videos,
        albumsInfo,
        allFiles,
        loadPhotos,
        loadMore,
        selectAlbums,
        handelSelectAlbums
    };
};