import { StatusBar, Text, View, SafeAreaView, useWindowDimensions, Pressable, Platform, FlexAlignType, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, Octicons } from '@expo/vector-icons'
import Card from './components/Card'
import feedData from '../../../data/feedData.json'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomBarParamList } from 'src/navigation/types'
import { FlashList } from '@shopify/flash-list'
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
    runOnUI,
    measure
} from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'

type FeedInfo = {
    id: string;
    image: string;
    title: string;
    likes: string;
}

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;

interface HeaderProps {
    insets: {
        top: number;
        [key: string]: number;
    };
    onNotificationPress: () => void;
    iconStyle: any;
    handlePress: () => void;
}

const headerStyles = {
    logoContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as FlexAlignType,
        padding: 10,
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
                onPress={handlePress}
            >
                <Text style={styles.logoText}>P!</Text>
                <Animated.View style={iconStyle}>
                    <Ionicons
                        name="caret-down"
                        size={14}
                        color="#1a1a1a"
                        style={{ marginTop: 5 }}
                    />
                </Animated.View>
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

    // Animated values
    const listRef = useAnimatedRef();
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
                const measured = measure(listRef);
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
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                setFeed(feedData);
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
            image={item.image}
            title={item.title}
            likes={item.likes}
            index={index}
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

            <View style={styles.feedContainer}>
                <FlashList
                    data={isLoading ? [] : feed}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    estimatedItemSize={200}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    ListEmptyComponent={ListEmptyComponent}
                    contentContainerStyle={styles.contentContainer}
                    removeClippedSubviews={true}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    updateCellsBatchingPeriod={50}
                />
            </View>

            <BottomSheet ref={bottomSheetRef} handleClose={() => { }} />
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
        padding: 10,
        borderRadius: 100,
    },
    logoText: {
        fontFamily: 'PottaOne_400Regular',
        fontSize: 20,
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