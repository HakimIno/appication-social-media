import { Button, Platform, Pressable, StyleSheet, Text, View, Image, TextInput, Keyboard, useWindowDimensions, SafeAreaView, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/navigation/types';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated';
import MainLayout from 'src/components/MainLayout';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TabView } from 'react-native-tab-view';
import ProfileDetailsHeaderTabBar from 'src/components/ProfileDetailsHeaderTabBar';
import feedData from '../../data/feedData.json';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, "profile_details_screen">;

type FeedInfo = {
    image: string
}

type Props = {
    navigation: ProfileDetailsNavigationProp
    route: RouteProp<RootStackParamList, "profile_details_screen">;
};

const TABS = [
    { name: "ทั้งหมด", title: "AllScreen", icon: "grid-outline", iconActive: "grid" },
    { name: "กดใจ", title: "HeartScreen", icon: "heart-outline", iconActive: "heart" },
    { name: "บันทึก", title: "BookingScreen", icon: "bookmark-outline", iconActive: "bookmark" }
];

const renderCustomTabView = (props: any) => <ProfileDetailsHeaderTabBar {...props} tabs={TABS} />

const { height } = Dimensions.get("window")
const threshold = height > 900 ? Math.round(height * 0.29) : Math.round(height * 0.35);

const ProfileDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { image, username } = route.params;
    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const [feed, setFeed] = useState<FeedInfo[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets()

    useFocusEffect(
        useCallback(() => {
            return () => {
                bottomSheetRef.current?.close()
            };
        }, [])
    );

    useEffect(() => {
        setIsLoading(true)
        setTimeout(() => {
            setFeed(feedData);
            setIsLoading(false);
        }, 1000);
    }, []);


    const [inputText, setInputText] = useState('');
    const [text, setText] = useState(`🍂🍃 ตกหลุมรักคุณทุกวัน\n🍂🍃 ตกหลุมรักคุณทุกวัน\n`);
    const [imageModal, setImageModal] = useState("");

    const handleSave = () => {
        setText(inputText);
        Keyboard.dismiss();
        bottomSheetRef.current?.close()
    };
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState(TABS.map((tab) => ({ key: tab.title, title: tab.title })));

    const heightValue = useSharedValue(0);
    const heightValueX = useSharedValue(threshold);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            if (event.contentOffset.y <= threshold) {
                heightValue.value = event.contentOffset.y;
                heightValueX.value = event.contentOffset.y;
            }
        },
        onEndDrag: (event) => {
            if (event.contentOffset.y === threshold) {
                heightValue.value = threshold
            }
        }
    });

    const heightAnimationStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(heightValue.value, [0, 200], [1, 0], Extrapolation.CLAMP),
            transform: [{ translateY: -(heightValue.value) }],
        };
    });


    const stickyAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -(heightValue.value) }],
        };
    });


    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case TABS[0].title:
                return <Tab1 navigation={navigation} scrollHandler={scrollHandler} feed={feed} isLoading={isLoading} />;
            case TABS[1].title:
                return <Tab1 navigation={navigation} scrollHandler={scrollHandler} feed={feed} isLoading={isLoading} />;
            case TABS[2].title:
                return <View></View>;
        }
    };

    return (
        <MainLayout
            titile={username}
            goBack={() => navigation.goBack()}
            iconRight={{ show: true, onPress: () => bottomSheetRef.current?.expand() }}>
            <View style={styles.container}>
                <Animated.View style={[styles.headerContainer, heightAnimationStyle]}>
                    <View style={styles.infoContainer}>
                        <Pressable onPress={() => navigation.navigate("image_profile_screen", { image, username })}>
                            <Image
                                source={{ uri: image }}
                                style={styles.image}
                            />
                        </Pressable>

                        <View style={styles.subInfoContainer}>
                            <View style={styles.layoutInfoContainer}>
                                <Text style={styles.textInfoSubTitle} numberOfLines={1}>212</Text>
                                <Text style={styles.textInfoTitle} numberOfLines={1}>โพสต์</Text>
                            </View>
                            <View style={styles.layoutInfoContainer} >
                                <Text style={styles.textInfoSubTitle} numberOfLines={1}>123M</Text>
                                <Text style={styles.textInfoTitle} numberOfLines={1}>ผู้ติดตาม</Text>
                            </View>
                            <View style={styles.layoutInfoContainer}>
                                <Text style={styles.textInfoSubTitle} numberOfLines={1}>222</Text>
                                <Text style={[styles.textInfoTitle, { width: 60 }]} numberOfLines={1}>กำลังติดตาม</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            <Text style={[styles.textInfoSubTitle, { fontSize: 15 }]} numberOfLines={1}>{username}</Text>
                            <Ionicons name="logo-instagram" size={22} color="black" />
                            <Ionicons name="logo-facebook" size={22} color="black" />
                        </View>

                        <View style={{ marginVertical: 10, }}>
                            {text && (
                                <Text style={styles.textInfoTitle} numberOfLines={3}>
                                    {text.split('\n').map((line, index) => (
                                        <Text key={index}>
                                            {line}
                                            {'\n'}
                                        </Text>
                                    ))}
                                </Text>)}
                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        marginHorizontal: 10
                    }}>
                        <Pressable style={{
                            paddingVertical: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'black',
                            width: "70%",
                            marginEnd: "2%",
                            borderRadius: 12,
                        }} >
                            <Text style={[styles.textInfoSubTitle, { color: "white", fontSize: 16 }]}>
                                ติดตาม
                            </Text>
                        </Pressable>

                        {/* <TouchableOpacity
                            activeOpacity={0.5}
                            style={{
                                paddingVertical: 5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                width: "70%",
                                marginEnd: "2%",
                                borderRadius: 12,
                                borderWidth: 0.5,
                                borderColor: "#ccc",
                                flexDirection: 'row',
                            }} >

                            <Text style={[styles.textInfoSubTitle, { color: "black", fontSize: 16, marginEnd: 10 }]}>
                                ข้อความ
                            </Text>
                            <Feather name="send" size={18} color="#1a1a1a" />
                        </TouchableOpacity> */}
                        <View style={{
                            paddingVertical: 7,
                            width: "12%",
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginEnd: "2%",
                            borderRadius: 12,
                            borderWidth: 0.5,
                            borderColor: "#ccc",
                        }}>
                            <Ionicons name="person-remove" size={22} color="#1a1a1a" />
                        </View>

                        <View style={{
                            paddingVertical: 7,
                            width: "12%",
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginEnd: "2%",
                            borderRadius: 12,
                            borderWidth: 0.5,
                            borderColor: "#ccc",
                        }}>
                            <Ionicons name="caret-up" size={22} color="#1a1a1a" />
                        </View>

                    </View>

                </Animated.View>

                <Animated.View
                    style={[{
                        height: layout.height,
                        backgroundColor: 'white',
                    }, stickyAnimationStyle]}
                >
                    <TabView
                        renderTabBar={(props) => renderCustomTabView(props)}
                        navigationState={{ index, routes }} // Ensure you have 'routes' defined
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        initialLayout={{ width: layout.width }}
                    />
                </Animated.View>
            </View>

            <BottomSheet ref={bottomSheetRef} handleClose={() => { }}>
                <Text style={[styles.textInfoSubTitle, { marginBottom: 15, fontSize: 20 }]} numberOfLines={1}>สร้าง bio ของคุณเอง</Text>
                <View style={{ width: "100%" }}>
                    <TextInput
                        style={styles.input}
                        multiline
                        numberOfLines={4}
                        onChangeText={setInputText}
                        value={inputText}
                    />

                    <Pressable style={styles.btnContainer} onPress={handleSave}>
                        <Text style={[styles.textInfoSubTitle, { color: "white" }]}>บันทึก</Text>
                    </Pressable>
                </View>
            </BottomSheet>
        </MainLayout >
    )
}

export default ProfileDetailsScreen

type TabProps = {
    navigation: any
    scrollHandler: any;
    feed: FeedInfo[]
    isLoading: boolean
};

const Tab1: React.FC<TabProps> = ({ navigation, scrollHandler, feed, isLoading }) => {
    const renderItem = useMemo(
        () => ({ item, index }: any) => (
            <Pressable
                onPress={() => navigation.navigate("gallery_screen", { index, feed: feedData })}
                style={{ width: "33%", height: 180, padding: 1, }}
            >
                <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
            </Pressable>
        ),
        []
    );
    const keyExtractor = useMemo(() => (item: { id: any }) => item.id, []);

    if (isLoading) {
        return (
            <View style={{ flex: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                <LottieView
                    autoPlay
                    style={{
                        width: 80,
                        height: 80,
                    }}
                    source={require('../../assets/lottiefiles/cameraloading.json')}
                />
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Animated.FlatList
                data={feedData}
                keyExtractor={keyExtractor}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.contentContainer}
                renderItem={renderItem}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                numColumns={3}
                onScroll={scrollHandler}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    headerContainer: {
        height: threshold,
    },
    infoContainer: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center'
    },
    subInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    layoutInfoContainer: {
        alignItems: 'center',
    },
    textInfoTitle: {
        fontSize: 13,
        fontFamily: 'LINESeedSansTH_A_Rg',
        lineHeight: 13 * 1.2,
    },
    textInfoSubTitle: {
        fontSize: 17,
        fontFamily: 'LINESeedSansTH_A_Bd'
    },
    input: {
        marginBottom: 20,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        borderRadius: 15
    },
    btnContainer: {
        borderWidth: 1.5,
        borderColor: "#84cc16",
        backgroundColor: '#1a1a1a',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100
    },
    separator: {
        height: 0,
    },
    contentContainer: {
        paddingHorizontal: 0.5,
        backgroundColor: "white",
        paddingBottom: Dimensions.get("window").height * 0.5
    },
})