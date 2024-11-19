import {
    StyleSheet,
    View,
    Keyboard,
    useWindowDimensions,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    InteractionManager
} from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated'
import MainLayout from 'src/components/MainLayout'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { Feather, Ionicons } from '@expo/vector-icons'
import { TabView } from 'react-native-tab-view'
import ProfileDetailsHeaderTabBar from 'src/components/ProfileDetailsHeaderTabBar'
import LottieView from 'lottie-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProfileAction from './components/ProfileActions'
import { ProfileBio } from './components/ProfileBio'
import { ProfileHeader } from './components/ProfileHeader'
import { faker } from '@faker-js/faker/.'
import { generateMockGridFeed } from 'src/data/mockFeedData'
import { memo } from 'react';
import { Image as ExpoImage } from 'expo-image';

// Types
type ProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, "profile_details_screen">

type FeedInfo = {
    id: string;
    image: string;
}

type Props = {
    navigation: ProfileDetailsNavigationProp;
    route: RouteProp<RootStackParamList, "profile_details_screen">;
}

type TabProps = {
    navigation: ProfileDetailsNavigationProp;
    scrollHandler: any;
    feed: FeedInfo[];
    isLoading: boolean;
    headerHeight: number;
}

// Constants
const { width, height } = Dimensions.get("window")
const SPRING_CONFIG = {
    damping: 15,
    mass: 0.7,
    stiffness: 150
}

const PROFILE_SECTION_HEIGHT = 150  // ส่วนของ Profile Header
const BIO_SECTION_HEIGHT = 70       // ส่วนของ Bio
const ACTION_SECTION_HEIGHT = 50    // ส่วนของ Action buttons
const TAB_BAR_HEIGHT = 48          // ความสูงของ Tab Bar

// คำนวณ HEADER_HEIGHT จากความสูงจริงของแต่ละส่วน + padding
const HEADER_HEIGHT = PROFILE_SECTION_HEIGHT +
    BIO_SECTION_HEIGHT +
    ACTION_SECTION_HEIGHT +
    (16 * 3)

const TABS = [
    { name: "ทั้งหมด", title: "AllScreen", icon: "grid-outline", iconActive: "grid" },
    { name: "กดใจ", title: "HeartScreen", icon: "heart-outline", iconActive: "heart" },
    { name: "บันทึก", title: "BookingScreen", icon: "bookmark-outline", iconActive: "bookmark" }
]

const LoadingView = () => (
    <View style={styles.loadingContainer}>
        <LottieView
            autoPlay
            style={styles.lottie}
            source={require('../../assets/lottiefiles/cameraloading.json')}
        />
    </View>
)

const ProfileDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { image, username } = route.params
    const bottomSheetRef = useRef<BottomSheetMethods>(null)
    const [feed, setFeed] = useState<FeedInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const layout = useWindowDimensions()
    const insets = useSafeAreaInsets()

    const [index, setIndex] = useState(0)
    const [routes] = useState(TABS.map((tab) => ({ key: tab.title, title: tab.title })))

    // Bio state
    const [inputText, setInputText] = useState('')
    const [text, setText] = useState(`🍂🍃 ตกหลุมรักคุณทุกวัน\n🍂🍃 ตกหลุมรักคุณทุกวัน\n`)

    // Animation value
    const scrollY = useSharedValue(0)

    // Effects
    useFocusEffect(
        useCallback(() => {
            return () => {
                bottomSheetRef.current?.close()
            }
        }, [])
    )

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const newFeed = generateMockGridFeed(10);
            setFeed(newFeed);
            setIsLoading(false);
        }, faker.number.int({ min: 500, max: 1500 }));

        return () => clearTimeout(timer);
    }, []);
    // Handlers
    const handleSave = useCallback(() => {
        setText(inputText)
        Keyboard.dismiss()
        bottomSheetRef.current?.close()
    }, [inputText])

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet'
            // ปรับการ scroll ให้นุ่มนวลขึ้น
            const offsetY = Math.min(
                event.contentOffset.y,
                HEADER_HEIGHT - TAB_BAR_HEIGHT // หักลบความสูงของ Tab Bar
            )
            scrollY.value = withSpring(offsetY, {
                ...SPRING_CONFIG,
                overshootClamping: true // ป้องกันการ scroll เกิน
            })
        }
    })

    // Animated styles
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
            [1, 0],
            Extrapolation.CLAMP
        ),
        transform: [{
            translateY: interpolate(
                scrollY.value,
                [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
                [0, -(HEADER_HEIGHT - TAB_BAR_HEIGHT)],
                Extrapolation.CLAMP
            )
        }]
    }))

    const tabsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: interpolate(
                scrollY.value,
                [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
                [0, -(HEADER_HEIGHT - TAB_BAR_HEIGHT)],
                Extrapolation.CLAMP
            )
        }]
    }))

    // Tab view
    const renderCustomTabBar = useCallback((props: any) => (
        <ProfileDetailsHeaderTabBar {...props} tabs={TABS} />
    ), [])

    const renderScene = useMemo(() => {
        return ({ route }: any) => {
            switch (route.key) {
                case TABS[0].title:
                    return (
                        <Tab1
                            navigation={navigation}
                            scrollHandler={scrollHandler}
                            feed={feed}
                            isLoading={isLoading}
                            headerHeight={HEADER_HEIGHT - HEADER_HEIGHT * 2.5}
                        />
                    )
                case TABS[1].title:
                    return (
                        <Tab1
                            navigation={navigation}
                            scrollHandler={scrollHandler}
                            feed={feed}
                            isLoading={isLoading}
                            headerHeight={HEADER_HEIGHT - HEADER_HEIGHT * 2.5}
                        />
                    )
                case TABS[2].title:
                    return <View style={styles.emptyTab} />
                default:
                    return null
            }
        }
    }, [navigation, feed, isLoading, scrollHandler])

    return (
        <MainLayout
            titile={username}
            goBack={() => navigation.goBack()}
            iconRight={{ show: true, onPress: () => bottomSheetRef.current?.expand() }}>
            <View style={styles.container}>
                <Animated.View style={[headerAnimatedStyle]}>
                    <View style={styles.profileSection}>
                        <ProfileHeader
                            image={image}
                            username={username}
                            navigation={navigation}
                        />
                    </View>
                    <View style={styles.bioSection}>
                        <ProfileBio username={username} />
                    </View>
                    <View style={styles.actionSection}>
                        <ProfileAction />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.tabContainer, tabsAnimatedStyle]}>
                    <TabView
                        renderTabBar={renderCustomTabBar}
                        navigationState={{ index, routes }}
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        initialLayout={{ width: layout.width }}
                        lazy
                    />
                </Animated.View>
            </View>
        </MainLayout>
    )
}

const PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface GridItemProps {
    item: FeedInfo;
    index: number;
    onPress: (index: number) => void;
    size: number;
}

const GridItem = memo(({ item, index, onPress, size }: GridItemProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const imageStyle = useMemo(() => ({
        width: size,
        height: size * 1.4,
    }), [size]);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(index)}
            style={[styles.gridItem, imageStyle]}
        >
            <ExpoImage
                source={item.image}
                style={[
                    styles.gridImage,
                    hasError && styles.imageError,
                    isLoading && styles.imageLoading
                ]}
                contentFit="cover"
                transition={200}
                placeholder={PLACEHOLDER_BLURHASH}
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                }}
                cachePolicy="memory-disk"
            />
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#999" />
                </View>
            )}
            {hasError && (
                <View style={styles.errorOverlay}>
                    <Ionicons name="image-outline" size={24} color="#999" />
                </View>
            )}
        </TouchableOpacity>
    );
});


// Image Preloader Component
const ImagePreloader = memo(({ imageUrls }: { imageUrls: string[] }) => {
    useEffect(() => {
        // Preload images in chunks to avoid memory issues
        const preloadImages = async () => {
            const CHUNK_SIZE = 10;
            for (let i = 0; i < imageUrls.length; i += CHUNK_SIZE) {
                const chunk = imageUrls.slice(i, i + CHUNK_SIZE);
                await Promise.all(
                    chunk.map(url => ExpoImage.prefetch(url))
                );
            }
        };

        InteractionManager.runAfterInteractions(() => {
            preloadImages();
        });
    }, [imageUrls]);

    return null;
});

const Tab1: React.FC<TabProps> = ({
    navigation,
    scrollHandler,
    feed,
    isLoading,
    headerHeight
}) => {
    // Memoized calculations
    const itemSize = useMemo(() => width / 3 - 1, []);
    const minContentHeight = useMemo(() => height + HEADER_HEIGHT, []);
    const itemHeight = useMemo(() => itemSize * 1.4, [itemSize]);

    // Callbacks
    const handlePress = useCallback((index: number) => {
        navigation.navigate("gallery_screen", {
            index,
            feed
        });
    }, [navigation, feed]);

    const getItemLayout = useCallback((data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * Math.floor(index / 3),
        index,
    }), [itemHeight]);

    const renderItem = useCallback(({ item, index }: {
        item: FeedInfo;
        index: number;
    }) => (
        <GridItem
            item={item}
            index={index}
            onPress={handlePress}
            size={itemSize}
        />
    ), [itemSize, handlePress]);

    const keyExtractor = useCallback((item: FeedInfo) => item.id, []);

    const contentContainerStyle = useMemo(() => ({
        paddingTop: headerHeight,
        paddingBottom: height * 0.2,
        minHeight: minContentHeight
    }), [headerHeight, minContentHeight]);

    const imageUrls = useMemo(() => feed.map(item => item.image), [feed]);

    if (isLoading) {
        return <LoadingView />;
    }

    return (
        <View style={styles.container}>
            <ImagePreloader imageUrls={imageUrls} />
            <Animated.FlatList
                removeClippedSubviews={true}
                maxToRenderPerBatch={40}
                windowSize={20}
                initialNumToRender={60}
                updateCellsBatchingPeriod={50}
                onEndReachedThreshold={0.5}
                data={feed}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                numColumns={3}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    contentContainerStyle
                ]}
                columnWrapperStyle={styles.columnWrapper}
                getItemLayout={getItemLayout}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 1,
                }}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    tabContainer: {
        height: '100%',
        backgroundColor: 'white', // แก้จาก 'red' เป็น 'white'
    },
    tabContent: {
        flex: 1,
    },
    profileSection: {
        height: PROFILE_SECTION_HEIGHT,
        justifyContent: 'center',
    },
    bioSection: {
        height: BIO_SECTION_HEIGHT,
    },
    actionSection: {
        height: ACTION_SECTION_HEIGHT,
    },
    gridItem: {
        padding: 0.5,
        backgroundColor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    imageLoading: {
        opacity: 1,
    },
    imageError: {
        opacity: 0.5,
        backgroundColor: '#f5f5f5',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        backgroundColor: 'white',
        paddingBottom: height * 0.1,
        paddingHorizontal: 0,
    },
    loadingContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    columnWrapper: {
        justifyContent: 'flex-start', // จัดให้ items ชิดซ้าย
        gap: 0,                       // ไม่มีช่องว่างระหว่าง items
    },
    lottie: {
        width: 80,
        height: 80,
    },
    emptyTab: {
        flex: 1,
        backgroundColor: 'white',
    },
    bottomSheetTitle: {
        marginBottom: 15,
        fontSize: 20,
        fontFamily: 'LINESeedSansTH_A_Bd',
    },
    bottomSheetContent: {
        width: "100%",
    },
    input: {
        marginBottom: 20,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        borderRadius: 15,
    },
    btnContainer: {
        borderWidth: 1.5,
        borderColor: "#84cc16",
        backgroundColor: '#1a1a1a',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
    btnText: {
        fontSize: 17,
        fontFamily: 'LINESeedSansTH_A_Bd',
        color: "white",
    },
})

export default ProfileDetailsScreen