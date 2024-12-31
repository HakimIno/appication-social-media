import { StatusBar, Text, View, SafeAreaView, useWindowDimensions, Pressable, Platform, FlexAlignType, StyleSheet, RefreshControl, } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import Svg, { Path, Circle } from 'react-native-svg'
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
    measure,
    withSpring,
    interpolateColor,
    withSequence,
    Easing,
    withRepeat
} from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'
import { useTheme, lightTheme, darkTheme } from 'src/context/ThemeContext'
import type { Theme } from 'src/context/ThemeContext'

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
    isDarkMode: boolean;
    onThemePress: (x: number, y: number) => void;
    themeIconStyle: any;
    theme: Theme;
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

const SunIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="4" fill={color} />
        <Circle cx="12" cy="12" r="3" fill={color} opacity="0.3" />

        <Path d="M12 5V3" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 21V19" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M19 12H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M3 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" />

        <Path d="M17.657 6.343L18.95 5.05" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M5.05 18.95L6.343 17.657" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M18.95 18.95L17.657 17.657" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M5.05 5.05L6.343 6.343" stroke={color} strokeWidth="2" strokeLinecap="round" />

        <Circle
            cx="12"
            cy="12"
            r="6"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="1 2"
        />
    </Svg>
);

const MoonIcon = ({ color }: { color: string }) => (
    <Svg width="22" height="24" viewBox="0 0 24 24" fill="none">
        <Path
            d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.1546 15.0821 7.84277 10.7703 7.84277 5.44975C7.84277 3.99474 8.20599 2.62458 8.84643 1.42485C5.08506 2.42485 2.34277 5.85095 2.34277 9.91711C2.34277 14.9677 6.36277 19.0821 11.3427 19.0821C15.4089 19.0821 18.835 16.3398 19.835 12.5784C20.4693 13.1334 21.0161 13.5784 21.5 14.0784Z"
            fill={color}
            opacity="0.2"
        />
        <Path
            d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.1546 15.0821 7.84277 10.7703 7.84277 5.44975C7.84277 3.99474 8.20599 2.62458 8.84643 1.42485C5.08506 2.42485 2.34277 5.85095 2.34277 9.91711C2.34277 14.9677 6.36277 19.0821 11.3427 19.0821C15.4089 19.0821 18.835 16.3398 19.835 12.5784"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        <Circle cx="19.5" cy="4.5" r="1.5" fill={color} />
        <Circle cx="15.5" cy="3.5" r="1" fill={color} opacity="0.6" />
        <Circle cx="20.5" cy="8.5" r="0.5" fill={color} opacity="0.4" />
    </Svg>
);


// แยก Header Component ออกมาเพื่อลด re-render
const Header = React.memo(({
    insets,
    onNotificationPress,
    iconStyle,
    handlePress,
    isDarkMode,
    onThemePress,
    themeIconStyle,
    theme
}: HeaderProps) => {
    const handleThemePress = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        onThemePress(pageX, pageY);
    };

    return (
        <View style={[styles.headerContainer, { backgroundColor: theme.backgroundColor, shadowColor: !isDarkMode ? '#000' : '#fff', borderColor: !isDarkMode ? '#000' : '#fff' }]}>
            <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
                <Pressable style={headerStyles.logoContainer}>
                    <Text style={[styles.logoText, { color: theme.textColor, zIndex: 1, marginBottom: 2 }]}>fl</Text>
                    <Ionicons name="flower-outline" size={24} color={theme.textColor} />
                    <Text style={[styles.logoText, { color: theme.textColor, zIndex: 1, marginBottom: 2 }]}>wergram</Text>
                </Pressable>

                <View style={styles.rightHeaderContainer}>
                    <Pressable
                        style={[styles.iconButton, { marginRight: 15 }]}
                        onPress={handleThemePress}
                    >
                        <Animated.View style={themeIconStyle}>
                            {!isDarkMode ? (
                                <MoonIcon color={theme.textColor} />
                            ) : (
                                <SunIcon color={theme.textColor} />
                            )}
                        </Animated.View>
                    </Pressable>

                    <Pressable
                        style={headerStyles.notificationContainer}
                        onPress={onNotificationPress}
                    >
                        <Octicons
                            name="bell"
                            size={22}
                            color={theme.textColor}
                        />
                        <View style={styles.notificationBadge} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
});

const HomeScreen = ({ navigation, route }: { navigation: HomeNavigationProp; route: any }) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();

    // Animated values
    const listRef = useRef<FlashList<FeedInfo>>(null);
    const heightValue = useSharedValue(0);
    const open = useSharedValue(false);
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0)
    );
    const themeRotation = useSharedValue(0);

    // Define handleRefresh first
    const handleRefreshAndScrollTop = useCallback(async () => {
        // Scroll to top first
        listRef.current?.scrollToIndex({ index: 0, animated: true });
        
        // Then refresh the feed
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

    // Watch for route.params changes to trigger refresh
    useEffect(() => {
        if (route.params?.refresh) {
            handleRefreshAndScrollTop();
        }
    }, [route.params?.refresh, handleRefreshAndScrollTop]);

    // Initial load
    useEffect(() => {
        handleRefreshAndScrollTop();
    }, [handleRefreshAndScrollTop]);

    // Memoized styles
    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: heightValue.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * -180}deg` }],
    }));

    const themeIconStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: withSpring(`${animatedValue.value * 360}deg`, {
                        damping: 15,
                        stiffness: 60,
                        mass: 0.8
                    })
                },
                {
                    scale: withSpring(1 + (animatedValue.value * 0.2), {
                        damping: 12,
                        stiffness: 100
                    })
                }
            ],
            opacity: withSpring(1, {
                damping: 20,
                stiffness: 90
            })
        };
    });

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

    const handleThemePress = useCallback((x: number, y: number) => {
        toggleTheme(x, y);
    }, [toggleTheme]);

    // Memoized handlers and components
    const renderItem = useCallback(({ item, index }: any) => (
        <Card
            navigation={navigation}
            images={item.images}
            title={item.title}
            likes={item.likes}
            onZoomStateChange={() => { }}
            cardIndex={index}
            key={`card-${item.id}-${index}`}
        />
    ), [navigation]);

    const keyExtractor = useCallback((item: FeedInfo, index: number) => `${item.id}-${index}`, []);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.loadingContainer}>
            <AnimatedText text="Loading..." color="#000000" />
        </View>
    ), []);

    const ItemSeparatorComponent = useCallback(() => (
        <View style={styles.separator} />
    ), []);

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme.backgroundColor }
        ]}>
            <StatusBar
                backgroundColor="transparent"
                translucent
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />

            <Header
                insets={insets}
                onNotificationPress={() => bottomSheetRef.current?.expand()}
                iconStyle={iconStyle}
                handlePress={handlePress}
                isDarkMode={isDarkMode}
                onThemePress={handleThemePress}
                themeIconStyle={themeIconStyle}
                theme={theme}
            />

            <View style={styles.mainContent}>
                <Animated.View style={heightAnimationStyle}>
                    <Animated.View ref={listRef} style={styles.contentContainerX}>
                        <View style={styles.content}>
                            <Text style={{ color: theme.textColor }}>kimsnow</Text>
                        </View>
                    </Animated.View>
                </Animated.View>

                <View style={styles.listContainer}>
                    <FlashList
                        ref={listRef}
                        data={feed}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        estimatedItemSize={350}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        ListEmptyComponent={ListEmptyComponent}
                        contentContainerStyle={styles.listContentContainer}
                        refreshing={isRefreshing}
                        onRefresh={handleRefreshAndScrollTop}
                    />
                </View>
            </View>
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

        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        elevation: 1,
        zIndex: 2,
    },
    subHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 100,
        paddingVertical: 10
    },
    logoText: {
        fontFamily: 'Funnel_600SemiBold',
        fontSize: 24,
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
    rightHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 5,
    },
    mainContent: {
        flex: 1,
        zIndex: 0,
    },
    listContainer: {
        flex: 1,
        width: '100%',
    },
    listContentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});

export default React.memo(HomeScreen);