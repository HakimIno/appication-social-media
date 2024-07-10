import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, SectionList, Animated as AnimatedRN, DimensionValue } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/navigation/types';
import { RouteProp } from '@react-navigation/native';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';
import Animated, { useAnimatedStyle, useSharedValue, withClamp, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import BottomSheetFlatList from 'src/components/BottomSheetFlatList';
import BottomSheetSectionList from 'src/components/BottomSheetSectionList';
import Dots from 'react-native-dots-pagination';
type GalleryNavigationProp = StackNavigationProp<RootStackParamList, "gallery_screen">;

type Props = {
    navigation: GalleryNavigationProp
    route: RouteProp<RootStackParamList, "gallery_screen">;
};

const { width, height } = Dimensions.get("screen");
const IMAGE_SIZE = 80;
const SPACING = 10
const GalleryScreen: React.FC<Props> = ({ navigation, route }) => {
    const { feed, index } = route.params
    const [activeIndex, setActiveIndex] = useState(0)
    const topRef = useRef<FlatList<any>>(null);
    const thumbRef = useRef<FlatList<any>>(null);
    const bottomSheetRef = useRef<BottomSheetMethods>(null);

    const scrollToActiveIndex = (index: number) => {
        setActiveIndex(index);
        topRef?.current?.scrollToOffset({
            offset: index * width,
            animated: true
        });
        if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
            thumbRef?.current?.scrollToOffset({
                offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
                animated: true
            });
        } else {
            thumbRef?.current?.scrollToOffset({
                offset: 0,
                animated: true
            });
        }
    }

    useEffect(() => {
        scrollToActiveIndex(index)
    }, [])


    const translateY = useSharedValue(0);

    const handlePress = useCallback(() => {
        translateY.value = withTiming(1);
        bottomSheetRef.current?.expand();
    }, [translateY]);

    const handleClose = useCallback(() => {
        translateY.value = withTiming(0);
    }, [translateY]);


    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -(translateY.value * 180) }],
        };
    });

    const scrollX = React.useRef(new AnimatedRN.Value(0)).current;

    return (
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,1)" }}>
            <StatusBar style="light" />
            <FlatList
                ref={topRef}
                data={feed}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, key) => key.toString()}
                onMomentumScrollEnd={ev => {
                    scrollToActiveIndex(Math.round(ev.nativeEvent.contentOffset.x / width))
                }}
                onScroll={AnimatedRN.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    {
                        useNativeDriver: false,
                    }
                )}
                renderItem={({ item, index }) => {
                    return (
                        <View style={{ width, height, justifyContent: 'center' }}>

                            <Animated.View style={[{ width: '100%', borderRadius: 13 }, animatedStyles]}>
                                <Pressable onPress={() => navigation.goBack()} style={{
                                    position: 'absolute',
                                    top: "-30%",
                                    left: 10,
                                    zIndex: 1,
                                    padding: 5,
                                    borderRadius: 200,
                                    backgroundColor: "rgba(255,255,255,0.2)"
                                }}>
                                    <Ionicons name="close" size={26} color="white" />
                                </Pressable>
                                <Pressable onPress={handlePress} style={{ width, height: height / 1.8, borderRadius: 8 }}>
                                    <View style={{
                                        position: 'absolute',
                                        top: "3%",
                                        right: 20,
                                        zIndex: 1,
                                        paddingHorizontal: 10,
                                        borderRadius: 100,
                                        backgroundColor: "rgba(0,0,0,0.5)"
                                    }}>
                                        <Text style={styles.textInfoTitle}>{index + 1}/{feed.length}</Text>
                                    </View>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={[{ width: '100%', height: '100%', borderRadius: 8 }]}
                                    />
                                </Pressable>
                                {/* <Pressable
                                    onPress={handlePress}
                                    style={{
                                        position: 'absolute',
                                        bottom: "3%",
                                        right: 20,
                                        zIndex: 1,
                                        padding: 10,
                                        borderRadius: 100,
                                        backgroundColor: "rgba(0,0,0,0.5)"
                                    }}>
                                    <Ionicons name="chatbubble-ellipses" size={22} color="white" />
                                </Pressable> */}
                            </Animated.View>
                        </View>
                    )
                }}
            />

            <Animated.View style={[styles.dotContainer, animatedStyles, { bottom: "22%" }]}>
                <Dots
                    passiveDotWidth={5}
                    passiveDotHeight={5}
                    activeDotWidth={7.5}
                    activeDotHeight={7.5}
                    width={55}
                    length={feed.length}
                    active={activeIndex}
                    passiveColor="rgba(0,0,0,0.4)"
                    activeColor="white"
                />
            </Animated.View>

            {/* <FlatList
                ref={thumbRef}
                data={feed}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, key) => key.toString()}
                style={{ position: 'absolute', bottom: IMAGE_SIZE / 2.5 }}
                contentContainerStyle={{ paddingHorizontal: SPACING }}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => scrollToActiveIndex(index)}
                        >
                            <Image
                                resizeMode="cover"
                                source={{ uri: item.image }}
                                style={{
                                    width: IMAGE_SIZE,
                                    height: IMAGE_SIZE,
                                    borderRadius: 15,
                                    marginRight: SPACING,
                                    borderWidth: 2,
                                    borderColor: activeIndex === index ? "#fff" : "rgba(0,0,0,0.1)"
                                }}
                            />

                            <View
                                style={{
                                    width: IMAGE_SIZE,
                                    height: IMAGE_SIZE,
                                    borderRadius: 15,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    backgroundColor: activeIndex === index ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.6)'
                                }}
                            />
                        </TouchableOpacity>
                    )
                }}
            /> */}



            {/* <BottomSheetFlatList
                ref={bottomSheetRef}
                data={feed}
                stickyHeaderIndices={[0]}
                renderItem={({ item, index }) => {
                    return (
                        <View style={{ paddingVertical: 40 }}>
                            <Text>{item.title}{index}</Text>
                        </View>
                    )
                }}
                ListHeaderComponent={() => (
                    <View style={{
                        paddingVertical: 5,
                        backgroundColor: 'white',
                        alignItems: "stretch",
                        borderBottomWidth: 0.5,
                        borderColor: '#d1d5db',
                    }}>
                        <Text style={styles.headerListText}>ความคิดเห็น (200)</Text>
                    </View>
                )}

                snapTo={'70%'}
                backgroundColor={'white'}
                backDropColor={'#242424'}
                handleClose={handleClose}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
            /> */}

            <BottomSheetSectionList
                ref={bottomSheetRef}
                data={feed}
                renderItem={({ item, index }) => {
                    return <View />
                }}
                ListHeaderComponent={() => (
                    <View style={{
                        paddingVertical: 5,
                        backgroundColor: 'white',
                        alignItems: "stretch",
                        borderBottomWidth: 0.5,
                        borderColor: '#d1d5db',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: "60%" }}>
                                <Image
                                    source={{ uri: feed[0].image }}
                                    style={[{ width: 45, height: 45, borderRadius: 45 }]}
                                />
                                <View>
                                    <Text style={styles.headerListText} numberOfLines={1}>{feed[0].title}</Text>
                                    <Text style={[styles.headerListText, { fontSize: 10, color: 'gray' }]} numberOfLines={1}>2024/06/13</Text>
                                </View>
                            </View>

                            <View style={{
                                width: "30%", height: 35,
                                backgroundColor: "#000000",
                                borderColor: "#84cc16",
                                borderWidth: 2, borderRadius: 25, alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={[styles.headerListText, { color: "white" }]}>ติดตาม</Text>
                            </View>
                        </View>
                    </View>
                )
                }
                snapTo={'70%'}
                backgroundColor={'white'}
                backDropColor={'#242424'}
                handleClose={handleClose}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
            />
        </View >
    )
}

export default GalleryScreen

const styles = StyleSheet.create({
    textInfoTitle: {
        fontSize: 11,
        fontFamily: 'LINESeedSansTH_A_Bd',
        color: "white"
    },
    headerListText: {
        fontSize: 15,
        fontFamily: 'LINESeedSansTH_A_Bd',
        color: "#242424",
        marginHorizontal: 10
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        position: 'absolute',
        bottom: "21%",
        left: "50%",
        right: "50%"
    },
    dot: {
        height: 10,
        width: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        margin: 8,
    },
})