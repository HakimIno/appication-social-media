import { Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';

import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, } from '@expo/vector-icons';
import Animated, { measure, runOnUI, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/navigation/types';
import { useCreateScreen } from './hooks/useCreateScreen';

const { width, height } = Dimensions.get("window")

export type CreateNavigationProp = StackNavigationProp<RootStackParamList, "create_screen">;

const CreateScreen = ({ navigation }: { navigation: CreateNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const Tab = createMaterialTopTabNavigator();

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


    const { loading, photos, videos, allFiles, albumsInfo, loadPhotos, selectAlbums, handelSelectAlbums } = useCreateScreen();;

    const initialRender = useRef(true);

    useEffect(() => {
        if (allFiles.length === 0) {
            loadPhotos();
        }
    }, []);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        heightValue.value = withTiming(0);
        open.value = false;
        loadPhotos();
    }, [selectAlbums]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (event.contentOffset.y) {
                heightValue.value = withTiming(0)
                open.value = false
            }
        },
    });


    const handlePress = () => {
        if (!loading && albumsInfo.length > 0) {
            if (heightValue.value === 0) {
                runOnUI(() => {
                    'worklet';
                    heightValue.value = withTiming(measure(listRef)!.height);
                })();
            } else {
                heightValue.value = withTiming(0);
            }
            open.value = !open.value;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'black', }}>
            <StatusBar style="light" backgroundColor="black" />
            <View style={{ flex: 1, marginTop: Platform.OS === "ios" ? 10 : insets.top }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Ionicons name="close" color={"white"} size={26} onPress={() => navigation.goBack()} />
                    <Pressable
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, }}
                        onPress={handlePress}
                    >
                        <Text style={styles.textHeaderitle} numberOfLines={1}>
                            {selectAlbums.title === "Pictures" ? "แกลเลอรี" : selectAlbums.title}
                        </Text>
                        <Animated.View style={iconStyle}>
                            <Ionicons name="caret-up" color={"white"} size={18} />
                        </Animated.View>
                    </Pressable>
                    <View></View>
                </View>

                <Animated.View style={heightAnimationStyle}>
                    <Animated.View style={styles.contentContainer} ref={listRef}>
                        <View style={styles.content}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(_, index) => index.toString()}
                                contentContainerStyle={{ paddingBottom: 30 }}
                                renderItem={({ item, index }: any) => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginRight: 10,
                                                paddingVertical: 5,
                                                // borderBottomWidth: index === albumsInfo.length - 1 ? 0 : 0.2,
                                                // borderBottomColor: "#d6d3d1",
                                                borderRadius: 5
                                            }}
                                            onPress={() => handelSelectAlbums(item.title, index)}
                                        >
                                            <View style={{
                                                flexDirection: 'row',
                                                gap: 12,
                                                alignItems: 'center',
                                            }}>
                                                <Image
                                                    source={{ uri: item.url }}
                                                    style={{
                                                        width: 70,
                                                        height: 70,
                                                        borderRadius: 5
                                                    }}
                                                />
                                                <View style={{ width: "60%", justifyContent: 'space-evenly' }}>
                                                    <Text style={[styles.textHeaderitle,]} numberOfLines={1}>
                                                        {item.title === "Pictures" ? "แกลเลอรี" : item.title}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'LINESeedSansTH_A_Rg',
                                                            marginLeft: 5,
                                                            color: "white",
                                                            fontSize: 12
                                                        }}
                                                    >({item.assetCount})</Text>
                                                </View>
                                            </View>
                                            {selectAlbums.indx === index ?
                                                <Ionicons name="radio-button-on" size={26} color="white" /> :
                                                <Ionicons name="radio-button-off" size={26} color="white" />}
                                        </TouchableOpacity>
                                    );
                                }}
                                data={albumsInfo}
                                overScrollMode="never"
                                scrollEventThrottle={16}
                                extraData={albumsInfo}
                                removeClippedSubviews={true}
                            />
                        </View>
                    </Animated.View>
                </Animated.View>
                <Tab.Navigator
                    style={{ width: "100%", backgroundColor: 'black', }}
                    screenOptions={{
                        tabBarStyle: {
                            backgroundColor: 'black',
                            elevation: 0,
                            height: 50,
                            width: "50%",
                            marginLeft: "25%"

                        },
                        tabBarIndicatorStyle: {
                            backgroundColor: 'white',
                            width: 35,
                            marginLeft: "8%",
                            alignItems: 'center'
                        },
                        tabBarActiveTintColor: "white",
                        tabBarShowLabel: false
                    }}
                >
                    <Tab.Screen name="Alls"

                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons name={focused ? "images" : "images-outline"} color={color} size={24} />
                            ),
                        }}
                    >
                        {() => loading ? <LoadingScreen /> : <TabScreen1 photos={allFiles} scrollHandler={scrollHandler} />}
                    </Tab.Screen>
                    <Tab.Screen name="Photos"
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons name={focused ? "image" : "image-outline"} color={color} size={24} />
                            ),
                        }}
                    >
                        {() => loading ? <LoadingScreen /> : <TabScreen1 photos={photos} scrollHandler={scrollHandler} />}
                    </Tab.Screen>
                    <Tab.Screen name="Videos"
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons name={focused ? "videocam" : "videocam-outline"} color={color} size={24} />
                            ),
                        }}>
                        {() => loading ? <LoadingScreen /> : <TabScreen1 photos={videos} scrollHandler={scrollHandler} />}
                    </Tab.Screen>
                </Tab.Navigator>


                <Pressable style={{
                    position: 'absolute', right: "5%", bottom: "5%",
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 10,
                    borderRadius: 100,
                    elevation: 10
                }} onPress={() => navigation.navigate("camera_screen")}>
                    <Ionicons name="camera" size={35} color="white" />
                </Pressable>
            </View>
        </View>
    )
}

export default CreateScreen

const LoadingScreen = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: "black" }}>
        <LottieView
            autoPlay
            style={{
                width: 120,
                height: 120,
            }}
            source={require('../../../assets/lottiefiles/cameraloading.json')}
        />
        <View />
    </View >
)

type TabScreenProps = {
    photos: MediaLibrary.Asset[];
    scrollHandler: any
};

const TabScreen1: React.FC<TabScreenProps> = ({ photos, scrollHandler }) => {
    function secondsToMinutes(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = remainingSeconds.toFixed(0).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    return (
        <Animated.View style={styles.container}>
            <Animated.FlatList
                keyExtractor={(_, index) => "photo" + '-' + index}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }: any) => {
                    return (
                        <View style={styles.image}>
                            <Image
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    width: "100%",
                                    height: "100%"
                                    , borderRadius: 5,
                                    resizeMode: 'cover'
                                }}
                                // placeholder={{ blurhash }}
                                source={item.uri}
                                contentFit="cover"
                            />

                            <View style={{ position: 'absolute', right: 3, bottom: 1 }}>
                                <Text style={[styles.textHeaderitle, { fontSize: 12 }]}>
                                    {item.duration ? String(secondsToMinutes(item.duration)) : null}
                                </Text>
                            </View>
                        </View>
                    )
                }}
                data={photos}
                contentContainerStyle={{ backgroundColor: "black" }}
                numColumns={3}
                onScroll={scrollHandler}
                overScrollMode="never"
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
            />

        </Animated.View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    loader: {
        marginVertical: 20,
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
    contentContainer: {
        position: 'absolute',
        width: '100%',
        top: 0,
    },
    content: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 5,
        height: height * 0.3,

    },
})