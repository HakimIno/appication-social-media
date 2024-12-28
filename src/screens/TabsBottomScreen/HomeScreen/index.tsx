import { StatusBar, Text, View, SafeAreaView, useWindowDimensions, Pressable, Platform, FlexAlignType, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, Octicons } from '@expo/vector-icons'
import Card from './components/Card'
import { generateMockGridFeed } from 'src/data/mockFeedData'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomBarParamList } from 'src/navigation/types'
import { FlashList } from '@shopify/flash-list'
import Animated, {
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
    runOnUI,
    measure
} from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'

interface FeedInfo {
    id: string
    images: string[]
    title: string
    likes: number
    comments: number
    description: string
    isVideo: boolean
    video?: string
}

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;

interface HeaderProps {
    insets: {
        top: number;
    };
    onNotificationPress: () => void;
    iconStyle: any;
    handlePress: () => void;
}

const headerStyles = {
    logoContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as FlexAlignType,
        paddingVertical: 0,
        borderRadius: 100,
    },
    notificationContainer: {
        position: 'relative' as const,
    },
} as const;

// แยก Header Component ออกมาเพื่อลด re-render
const Header = React.memo(({
    insets,
    onNotificationPress,
    iconStyle,
    handlePress
}: HeaderProps) => (
    <View style={[styles.headerContainer, { zIndex: 1 }]}>
        <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
            <Pressable
                style={headerStyles.logoContainer}
            >
                <Text style={[styles.logoText, { color: '#2563eb' }]}>Ja</Text>
                <Text style={[styles.logoText, { color: '#1a1a1a' }]}>n</Text>
                <Text style={[styles.logoText, { color: '#2563eb' }]}>Ja</Text>
                <Text style={[styles.logoText, { color: '#1a1a1a' }]}>o</Text>
            </Pressable>

            <Pressable
                style={headerStyles.notificationContainer}
                onPress={onNotificationPress}
            >
                <Octicons name="bell" size={22} color="#242424" />
                <View style={styles.notificationBadge} />
            </Pressable>
        </View>
    </View>
));

const HomeScreen = ({ navigation }: { navigation: HomeNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Animated values
    const listRef = useRef<FlashList<FeedInfo>>(null);
    const heightValue = useSharedValue(0);
    const open = useSharedValue(false);
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0)
    );

    // Memoized styles
    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: heightValue.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * -180}deg` }],
    }));

    const handlePress = useCallback(() => {
        runOnUI(() => {
            'worklet';
            if (heightValue.value === 0) {
                const measured = measure(listRef as any);
                if (measured) {
                    heightValue.value = withTiming(measured.height);
                }
            } else {
                heightValue.value = withTiming(0);
            }
            open.value = !open.value;
        })();
    }, []);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // ใช้ข้อมูล mock แทนการเรียก API
                const mockData = generateMockGridFeed(10);
                setFeed(mockData as unknown as FeedInfo[]);
            } catch (error) {
                console.error('Error loading feed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => bottomSheetRef.current?.close();
        }, [])
    );

    // Memoized handlers and components
    const renderItem = useCallback(({ item, index }: any) => (
        <Card
            navigation={navigation}
            images={item.images}
            title={item.title}
            likes={item.likes}
            onZoomStateChange={() => { }}
            cardIndex={index}
        />
    ), [navigation]);

    const keyExtractor = useCallback((item: FeedInfo) => item.id, []);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.loadingContainer}>
            <AnimatedText text="Loading..." color="#000000" />
        </View>
    ), []);

    const ItemSeparatorComponent = useCallback(() => (
        <View style={styles.separator} />
    ), []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const mockData = generateMockGridFeed(20);
            setFeed(mockData as unknown as FeedInfo[]);
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const scrollToTop = useCallback(() => {
        listRef.current?.scrollToIndex({ index: 0, animated: true });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="transparent"
                translucent
                barStyle="dark-content"
            />

            <Header
                insets={insets}
                onNotificationPress={() => bottomSheetRef.current?.expand()}
                iconStyle={iconStyle}
                handlePress={handlePress}
            />

            <Animated.View style={heightAnimationStyle}>
                <Animated.View ref={listRef} style={styles.contentContainerX}>
                    <View style={styles.content}>
                        <Text>kimsnow</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            <FlashList
                ref={listRef}
                data={feed}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                estimatedItemSize={350}
                overScrollMode="always"
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={styles.contentContainer}
                removeClippedSubviews={true}
                onEndReachedThreshold={0.5}
                estimatedFirstItemOffset={0}
                disableAutoLayout={false}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                initialScrollIndex={0}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10
                }}
            />


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    headerContainer: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        elevation: 1,
        zIndex: 0, // Add zIndex for shadow to work properly on Android
    },
    subHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 0,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 100,
    },
    logoText: {
        fontFamily: 'PottaOne_400Regular',
        fontSize: 26,
        color: "#1a1a1a"
    },
    notificationBadge: {
        backgroundColor: '#f43f5e',
        padding: 4,
        borderRadius: 20,
        position: 'absolute',
        top: -3,
        right: -2
    },
    notificationContainer: {
        position: 'relative',
    },
    contentContainerX: {
        overflow: 'hidden',
    },
    content: {
        padding: 10,
    },
    feedContainer: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    separator: {
        height: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100,
    },
});

export default React.memo(HomeScreen);