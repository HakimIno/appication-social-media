import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux-store';
import { setLoading, setPhotos, setVideos, setAlbumsInfo, setAllFiles, setSelectAlbums } from '../../../../redux-store/slices/mediaSlice';
import * as MediaLibrary from 'expo-media-library';
import { useEffect } from 'react';

export const useCreateScreen = () => {
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.medias.loading);
    const photos = useSelector((state: RootState) => state.medias.photos);
    const videos = useSelector((state: RootState) => state.medias.videos);
    const allFiles = useSelector((state: RootState) => state.medias.allFiles);
    const albumsInfo = useSelector((state: RootState) => state.medias.albumsInfo);

    const selectAlbums = useSelector((state: RootState) => state.medias.selectAlbums);
    const loadPhotos = async () => { // ต้องเปลี่ยนให้เป็น async function
        try {

            dispatch(setLoading(true));

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access media library denied');
                return;
            }

            const options = { first: 1000 };

            const getAlbum = await MediaLibrary.getAlbumAsync(selectAlbums.title);

            const { assets: photosAssets } = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.photo,
                album: getAlbum,
                ...options,
            });

            const { assets: videosAssets } = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.video,
                album: getAlbum,
                ...options,
            });

            const albumsResponse = await MediaLibrary.getAlbumsAsync();

            const albumsInfoArray = [];
            for (const album of albumsResponse) {
                if (album.assetCount > 0) {
                    const albumOptions = {
                        first: 1,
                        album: album.id,
                        mediaType: MediaLibrary.MediaType.photo,
                        sortBy: [MediaLibrary.SortBy.creationTime],
                        sortOrder: "desc",
                    };

                    const { assets } = await MediaLibrary.getAssetsAsync(albumOptions);
                    const albumAssets = assets.filter(item => item.albumId === album.id);

                    if (albumAssets.length > 0) {
                        const firstAsset = albumAssets[0];
                        albumsInfoArray.push({
                            title: album.title,
                            url: firstAsset.uri,
                            assetCount: album.assetCount,
                        });
                    }
                }
            }

            const sortedAlbumsInfo = albumsInfoArray.sort((a, b) => b.assetCount - a.assetCount);
            const sortedPhotos = photosAssets.sort((a, b) => b.creationTime - a.creationTime);
            const sortedVideos = videosAssets.sort((a, b) => b.creationTime - a.creationTime);
            const sortedAlls = [...sortedPhotos, ...sortedVideos].sort((a, b) => b.creationTime - a.creationTime);

            dispatch(setPhotos(photosAssets));
            dispatch(setVideos(videosAssets));
            dispatch(setAllFiles(sortedAlls));
            dispatch(setAlbumsInfo(sortedAlbumsInfo));

        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handelSelectAlbums = (title: string, indx: number) => {
        dispatch(setSelectAlbums({ title, indx }))
    }

    return {
        loading,
        photos,
        videos,
        albumsInfo,
        allFiles,
        loadPhotos,
        selectAlbums,
        handelSelectAlbums
    };
}

