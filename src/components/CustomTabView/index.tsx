import React, { useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    ViewStyle,
    ScrollView,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import PagerView from 'react-native-pager-view';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

interface Tab {
    key: string;
    title: string;
    content?: React.ReactNode; // เพิ่ม optional content
}

interface Props {
    tabs: Tab[];
    activeIndex: number;
    onTabPress: (index: number) => void;
    containerStyle?: ViewStyle;
}

const CustomTabView: React.FC<Props> = ({
    tabs,
    activeIndex,
    onTabPress,
    containerStyle,
}) => {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const pagerRef = React.useRef<PagerView>(null);
    const indicatorPosition = useSharedValue(0);
    const tabWidth = Math.min(width / 3, 120); // กำหนดความกว้างแท็บสูงสุด

    React.useEffect(() => {
        // อนิเมชั่น indicator
        indicatorPosition.value = withSpring(activeIndex * tabWidth, {
            damping: 15,
            stiffness: 150,
        });
        
        // เลื่อน tab ที่เลือกมาตรงกลาง
        scrollViewRef.current?.scrollTo({
            x: Math.max(0, activeIndex * tabWidth - width / 2 + tabWidth / 2),
            animated: true,
        });
        
        pagerRef.current?.setPage(activeIndex);
    }, [activeIndex]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorPosition.value }],
    }));

    const renderTab = (item: Tab, index: number) => (
        <TouchableOpacity
            key={item.key}
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => onTabPress(index)}
        >
            <Text style={[
                styles.tabText,
                activeIndex === index && styles.activeTabText
            ]}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    const onPageScroll = useCallback((e: any) => {
        const { position, offset } = e.nativeEvent;
        indicatorPosition.value = (position + offset) * tabWidth;
    }, [tabWidth]);

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.tabBarContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.tabBar}>
                        {tabs.map((tab, index) => renderTab(tab, index))}
                        <Animated.View
                            style={[
                                styles.indicator,
                                { width: tabWidth },
                                indicatorStyle,
                            ]}
                        />
                    </View>
                </ScrollView>
            </View>
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={activeIndex}
                onPageScroll={onPageScroll}
                onPageSelected={(e) => onTabPress(e.nativeEvent.position)}
            >
                {tabs.map((tab) => (
                    <View key={tab.key} style={styles.page}>
                        {tab.content || <Text>{tab.title} Content</Text>}
                    </View>
                ))}
            </PagerView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBarContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    scrollView: {
        height: 48,
    },
    scrollContent: {
        flexGrow: 1,
    },
    tabBar: {
        flexDirection: 'row',
        height: '100%',
        position: 'relative',
    },
    tab: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        backgroundColor: '#000',
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CustomTabView;