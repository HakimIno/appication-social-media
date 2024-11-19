import { StatusBar, Text, TouchableOpacity, View, SafeAreaView, I18nManager, useWindowDimensions, Pressable, Platform, TouchableWithoutFeedback, Vibration, TouchableNativeFeedback, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import LottieView from 'lottie-react-native'
import { styles } from './styles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, Octicons } from '@expo/vector-icons'
import Card from './components/Card'
import feedData from '../../../data/feedData.json';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomBarParamList } from 'src/navigation/types'
import HeaderTabBar from 'src/components/HeaderTabBar'
import { FlashList } from '@shopify/flash-list'
import Animated, { interpolate, measure, runOnUI, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'

const TABS = [
    { name: "ติดตาม", title: "ChatScreen", icon: "heart-outline", iconActive: "heart" },
    { name: "สำหรับคุณ", title: "CallScreen", icon: "flower-outline", iconActive: "flower" }
];

type FeedInfo = {
    id: string;
    image: string
    title: string;
    likes: string
}

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;



const renderCustomTabView = (props: any) => <HeaderTabBar {...props} tabs={TABS} />


const HomeScreen = ({ navigation }: { navigation: HomeNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const layout = useWindowDimensions();

    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const [feed, setFeed] = useState<FeedInfo[]>([])
    const [isLoading, setIsLoading] = useState(false);


    const listRef = useAnimatedRef();
    const heightValue = useSharedValue(0);
    const open = useSharedValue(false);
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0),
    );
    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: heightValue.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * -180}deg` }],
    }));

    const handlePress = () => {
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
    };

    useEffect(() => {
        setIsLoading(true)
        setTimeout(() => {
            setFeed(feedData);
            setIsLoading(false);
        }, 3000);
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => {
                bottomSheetRef.current?.close()
            };
        }, [])
    );

    const renderItem = useMemo(
        () => ({ item, index }: any) => <Card
            navigation={navigation}
            image={item.image}
            title={item.title}
            likes={item.likes}
            index={index}
        />,
        []
    );
    const keyExtractor = useMemo(() => (item: { id: any }) => item.id, []);

    const [refreshing, setRefreshing] = useState(false);
    const scrollY = useSharedValue(0);
    const refreshHeight = useSharedValue(0);


    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            if (event.contentOffset.y) {
                heightValue.value = withTiming(0)
                open.value = false
            }
        },
    });

    const refreshStyle = useAnimatedStyle(() => {
        return {
            height: refreshHeight.value,
            opacity: interpolate(refreshHeight.value, [0, 100], [0, 1]),
        };
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        // Perform your refresh logic here (e.g., fetching new data)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate refresh delay
        setRefreshing(false);
        refreshHeight.value = withTiming(0);
    };


    return (
        <View
            style={styles.container}
        >
            <StatusBar
                backgroundColor="transparent"
                translucent
                barStyle={"dark-content"}
            />

            <View style={[styles.headerContainer, { zIndex: 1 }]}>
                <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
                    <View style={{ borderRadius: 100, overflow: 'hidden' }}>
                        <TouchableNativeFeedback >
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10 }}>
                                <Text style={{ fontFamily: 'PottaOne_400Regular', fontSize: 20, color: "#1a1a1a" }}>P!</Text>
                                <Animated.View style={iconStyle}>
                                    <Ionicons name="caret-down" size={14} color="#1a1a1a" style={{ marginTop: 5 }} />
                                </Animated.View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <Pressable style={{
                        position: 'relative',
                    }}
                        onPress={() => bottomSheetRef.current?.expand()}
                    >
                        <Octicons name="bell" size={22} color="#242424" />
                        <View
                            style={{
                                backgroundColor: '#f43f5e',
                                padding: 4,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 20,
                                position: 'absolute',
                                top: -3,
                                right: -2
                            }}>
                        </View>
                    </Pressable>
                </View>
            </View>

            <Animated.View style={heightAnimationStyle}>
                <Animated.View style={styles.contentContainerX} ref={listRef}>
                    <View style={styles.content}>
                        <Text>kimsnow</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            <View style={{ flex: 1 }}>
                {!isLoading ? (
                    <Animated.View style={{ flex: 1 }}>
                        <FlashList
                            data={feed}
                            keyExtractor={keyExtractor}
                            overScrollMode="never"
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            contentContainerStyle={styles.contentContainer}
                            renderItem={renderItem}
                            scrollEventThrottle={16}
                            removeClippedSubviews={true}
                            estimatedItemSize={200}
                        />
                    </Animated.View>

                ) : <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 100 }}>
                    <AnimatedText text="Loading..." color="#000000" />
                    <View />
                </View>}

            </View>
            <BottomSheet ref={bottomSheetRef} handleClose={() => { }}>
                <View>

                </View>
            </BottomSheet>
        </View>
    )
}


export default HomeScreen

