import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useCallback, useRef } from "react";
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectPhotos } from "src/redux-store/slices/mediaSlice";
import * as MediaLibrary from 'expo-media-library';
import { RootState } from "src/redux-store";

type TabScreenProps = {
    photos: MediaLibrary.Asset[];
    onLoadMore?: () => void;
    loading?: boolean;
};

const secondsToMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toFixed(0).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
};

const { width, height } = Dimensions.get("window")

const TabScreen: React.FC<TabScreenProps> = ({ photos, onLoadMore, loading }) => {
    const dispatch = useDispatch();
    const selectedPhotos = useSelector((state: RootState) => state.medias.selectedPhotos);
    const listRef = useRef<FlashList<any>>(null);

    const scrollToTop = () => {
        if (listRef.current) {
            listRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };

    const handleLoadMore = () => {
        if (!loading && onLoadMore) {
            onLoadMore();
        }
    };

    const toggleSelectPhoto = useCallback((item: MediaLibrary.Asset) => {
        const isSelected = selectedPhotos.some((photo: MediaLibrary.Asset) => photo.id === item.id);

        let newSelectedPhotos: MediaLibrary.Asset[];
        if (isSelected) {
            newSelectedPhotos = selectedPhotos.filter((photo: MediaLibrary.Asset) => photo.id !== item.id);
        } else {
            newSelectedPhotos = [...selectedPhotos, item];
        }

        dispatch(setSelectPhotos(newSelectedPhotos));
    }, [dispatch, selectedPhotos]);

    const renderFooter = useCallback(() => {
        if (!loading) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#ff0050" />
            </View>
        );
    }, [loading]);

    const renderItem = useCallback(({ item }: any) => {
        const isSelected = selectedPhotos.some(photo => photo.id === item.id);
        const selectedIndex = selectedPhotos.findIndex(photo => photo.id === item.id) + 1;

        return (
            <Pressable
                onPress={() => toggleSelectPhoto(item)}
                style={[
                    styles.image,
                    isSelected && { borderWidth: 1, borderColor: "#ff0050" },
                    { borderRadius: 8 }
                ]}
            >
                <Image
                    style={{
                        backgroundColor: '#1a1a1a',
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                        resizeMode: 'cover',
                    }}
                    source={{ uri: item.uri }}
                    contentFit="cover"
                />

                {isSelected ? (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                top: 5,
                                right: 5,
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#ff0050',
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                {selectedIndex}
                            </Text>
                        </View>
                    </View>

                ) : <View style={styles.unselectedCountContainerStyle} />}

                <View style={{ position: 'absolute', right: 3, bottom: 1 }}>
                    <Text style={[styles.textHeaderitle, { fontSize: 12 }]}>
                        {item.duration ? secondsToMinutes(item.duration) : null}
                    </Text>
                </View>
            </Pressable>
        );
    }, [selectedPhotos, toggleSelectPhoto]);

    const renderSelectedPhoto = useCallback(({ item }: { item: any }) => (
        <View style={{ position: 'relative', width: '100%', flex: 1, justifyContent: 'flex-start', height: 100, marginHorizontal: 5 }}>
            <Image
                style={{
                    width: 65,
                    height: 65,
                    borderRadius: 8,
                }}
                source={{ uri: item.uri }}
                contentFit="cover"
            />
            <Pressable
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#ff0050',
                    borderRadius: 50,
                    padding: 2,
                }}
                onPress={() => toggleSelectPhoto(item)}
            >
                <Ionicons name="close" size={16} color="white" />
            </Pressable>
        </View>
    ), [toggleSelectPhoto]);

    return (
        <View style={styles.container}>
            <FlashList
                ref={listRef}
                keyExtractor={(_, index) => "photo" + '-' + index}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                data={photos}
                numColumns={3}
                estimatedItemSize={200}
                extraData={selectedPhotos}
                overScrollMode="never"
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />

            {selectedPhotos?.length > 0 && (
                <View style={{ width: '80%', height: 80, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', bottom: "3%", left: 0, borderRadius: 20, marginLeft: 10 }}>
                    <FlatList
                        data={selectedPhotos}
                        renderItem={renderSelectedPhoto}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        style={{ paddingVertical: 6, }}
                        contentContainerStyle={{ paddingHorizontal: 5 }}
                        showsHorizontalScrollIndicator={false}
                        overScrollMode="never"
                    />
                </View>
            )}

            <Pressable style={{
                position: 'absolute', right: "5%", bottom: "3%",
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 5,
                borderRadius: 100,
                elevation: 10
            }} onPress={scrollToTop}>
                <Ionicons name='caret-up' size={30} color="white" />
            </Pressable>
        </View>
    );
};

export default TabScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    image: {
        width: width / 3 - 2,
        height: 200,
        margin: 0.5,
    },
    textHeaderitle: {
        color: "white",
        fontFamily: 'LINESeedSansTH_A_Bd'
    },
    contentContainerStyle: {
        paddingBottom: 30
    },
    unselectedCountContainerStyle: {
        zIndex: 999,
        position: "absolute",
        right: 5,
        top: 5,
        width: 23,
        height: 23,
        borderRadius: 23,
        backgroundColor: "rgba(255,255,255, 0.4)",
        borderWidth: 1,
        borderColor: "white"
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center'
    }
});