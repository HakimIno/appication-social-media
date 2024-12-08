import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View, ViewabilityConfig, ViewabilityConfigCallbackPair } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { RouteProp } from '@react-navigation/native'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate,
    useAnimatedScrollHandler,
    withTiming,
    runOnJS
} from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import BottomSheetSectionList from 'src/components/BottomSheetSectionList'
import { Image as ExpoImage } from 'expo-image'
import { ActivityIndicator } from 'react-native'
import { FlashList, ListRenderItemInfo, ViewToken } from '@shopify/flash-list'
import ZoomableImage from '../components/ZoomableImage'
const PLACEHOLDER_BLURHASH = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

type GalleryNavigationProp = StackNavigationProp<RootStackParamList, "gallery_screen">
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
interface FeedInfo {
    id: string
    image: string
    title: string
    likes: number
    comments: number
    description: string
}
interface ScrollHandlerContext {
    prevX: number;
}

type Props = {
    navigation: GalleryNavigationProp
    route: RouteProp<RootStackParamList, "gallery_screen">
}

interface ImageLoadingState {
    [key: string]: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen")
const SPRING_CONFIG = {
    damping: 15,
    stiffness: 100,
    mass: 1
}

const MAX_ZOOM_SCALE = 3
const MIN_ZOOM_SCALE = 1

const GalleryScreen: React.FC<Props> = ({ navigation, route }) => {
    const { feed, index: initialIndex } = route.params
    const bottomSheetRef = useRef<BottomSheetMethods>(null)

    // Animated values
    const currentIndex = useSharedValue(initialIndex)
    const scrollX = useSharedValue(0)
    const bottomSheetVisible = useSharedValue(0)


    useEffect(() => {
        const preloadImages = async () => {
            // Preload เฉพาะรูปที่อยู่ใกล้ index ปัจจุบัน
            const range = 2; // จำนวนรูปที่จะ preload ก่อนและหลัง
            const start = Math.max(0, initialIndex - range);
            const end = Math.min(feed.length, initialIndex + range + 1);

            const imagesToPreload = feed.slice(start, end);
            await Promise.all(imagesToPreload.map((item: FeedInfo) => ExpoImage.prefetch(item.image)));

            // Preload รูปที่เหลือในพื้นหลัง
            const remainingImages = [
                ...feed.slice(0, start),
                ...feed.slice(end)
            ];
            setTimeout(() => {
                Promise.all(remainingImages.map(item => ExpoImage.prefetch(item.image)));
            }, 1000);
        };

        preloadImages();
    }, [feed, initialIndex]);

    const [isZoomed, setIsZoomed] = useState(false);

    const handleZoomStateChange = useCallback((zoomed: boolean) => {
        setIsZoomed(zoomed);
    }, []);


    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        if (!isZoomed) {
            scrollX.value = event.nativeEvent.contentOffset.x;
            currentIndex.value = Math.round(scrollX.value / SCREEN_WIDTH);
        }
    }, [isZoomed]);

    const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        if (!isZoomed) {
            const offsetX = event.nativeEvent.contentOffset.x;
            currentIndex.value = Math.round(offsetX / SCREEN_WIDTH);
        }
    }, [isZoomed]);

    // สร้าง derived values สำหรับ animations
    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value % SCREEN_WIDTH,
            [0, SCREEN_WIDTH / 2, SCREEN_WIDTH],
            [1, 0.95, 1]
        );

        return {
            transform: [{ scale }]
        };
    });

    const handleBottomSheetClose = useCallback(() => {
        bottomSheetVisible.value = withSpring(0, SPRING_CONFIG)
    }, [])


    const handleBottomSheetOpen = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const renderHeader = useCallback(() => (
        <View style={styles.bottomSheetHeader}>
            <View style={styles.profileContainer}>
                <ExpoImage
                    source={feed[currentIndex.value]?.image}
                    style={styles.profileImage}
                    contentFit="cover"
                    transition={200}
                    placeholder={PLACEHOLDER_BLURHASH}
                />
                <View>
                    <Text style={styles.profileName} numberOfLines={1}>
                        {feed[currentIndex.value]?.title}
                    </Text>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <Pressable style={styles.followButton}>
                <Text style={styles.followButtonText}>ติดตาม</Text>
            </Pressable>
        </View>
    ), [])



    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <Pressable
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={26} color="white" />
            </Pressable>

            {/* <View style={styles.counter}>
                <Text style={styles.counterText}>
                    {indexx + 1}/{feed.length}
                </Text>
            </View> */}

            <AnimatedFlashList
                data={feed}
                scrollEnabled={!isZoomed}
                estimatedItemSize={SCREEN_HEIGHT}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                //@ts-ignore
                renderItem={({ item, index }: ListRenderItemInfo<FeedInfo>) => (
                    <Animated.View
                        style={[
                            {
                                width: SCREEN_WIDTH,
                                height: SCREEN_HEIGHT,
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                            animatedStyle,
                        ]}
                    >
                        <ZoomableImage
                            item={item}
                            index={index}
                            onZoomStateChange={handleZoomStateChange}
                            onOpenBottomSheet={handleBottomSheetOpen}
                        />
                    </Animated.View>
                )}
                keyExtractor={(item: any) => item.id.toString()}
                getItemType={() => 'image'}
                overrideItemLayout={(layout) => {
                    layout.size = SCREEN_HEIGHT;
                    layout.span = 1;
                }}
                drawDistance={SCREEN_HEIGHT * 2}
                initialScrollIndex={initialIndex}
                disableIntervalMomentum
                snapToInterval={SCREEN_HEIGHT}
                decelerationRate="normal"
            />

            <BottomSheetSectionList
                ref={bottomSheetRef}
                data={feed}
                renderItem={() => null}
                ListHeaderComponent={renderHeader}
                snapTo="70%"
                backgroundColor="white"
                backDropColor="#242424"
                handleClose={handleBottomSheetClose}
                scrollEventThrottle={16}
                removeClippedSubviews
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
        borderRadius: 8
    },
    imageError: {
        backgroundColor: '#f3f4f6'
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
        fontFamily: 'LINESeedSansTH_A_Rg'
    },
    closeButton: {
        position: 'absolute',
        top: "8%",
        right: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    counter: {
        position: 'absolute',
        top: '6.5%',
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    counterText: {
        fontSize: 12,
        color: 'white',
        fontFamily: 'LINESeedSansTH_A_Bd'
    },
    bottomSheetHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: '#d1d5db'
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 15
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 23,
        marginRight: 10
    },
    profileName: {
        fontSize: 15,
        fontFamily: 'LINESeedSansTH_A_Bd',
        color: '#242424'
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'LINESeedSansTH_A_Bd',
        color: '#6b7280'
    },
    followButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#000',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#84cc16'
    },
    followButtonText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'LINESeedSansTH_A_Bd'
    },
    // Add these new styles for improved zooming experience
    zoomIndicator: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 12,
    },
    zoomText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'LINESeedSansTH_A_Rg'
    }
})

export default GalleryScreen