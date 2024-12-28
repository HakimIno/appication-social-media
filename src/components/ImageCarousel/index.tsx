import React, { useCallback, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { FlashList, ViewToken } from '@shopify/flash-list';
import { Image as ExpoImage } from 'expo-image';
import { GestureDetector, GestureType } from 'react-native-gesture-handler';
import Animated, { AnimatedStyleProp,  } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

interface ImageCarouselProps {
    images: string[];
    onZoomStateChange?: (isZoomed: boolean) => void;
    gesture: any;
    animatedStyle: AnimatedStyleProp<ViewStyle>;
}

interface ViewableItemsChanged {
    viewableItems: ViewToken[];
    changed: ViewToken[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images,
    onZoomStateChange,
    gesture,
    animatedStyle
}) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const flashListRef = useRef<FlashList<string>>(null);

    const renderImage = useCallback(({ item: imageUrl, index }: { item: string; index: number }) => (
        <View style={styles.slideContainer}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                    <ExpoImage
                        source={imageUrl}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    ), [gesture, animatedStyle]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: ViewableItemsChanged) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const keyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

    return (
        <View style={styles.container}>
            <FlashList
                ref={flashListRef}
                data={images}
                renderItem={renderImage}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                    minimumViewTime: 100
                }}
                onViewableItemsChanged={onViewableItemsChanged}
                estimatedItemSize={SCREEN_WIDTH}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                initialScrollIndex={0}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0
                }}
            />

            {images.length > 1 && (
                <View style={styles.paginationContainer}>
                    {images.map((_, index) => (
                        <View
                            key={`dot-${index}`}
                            style={[
                                styles.paginationDot,
                                currentIndex === index && styles.paginationDotActive
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
    },
    slideContainer: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 3,
    },
    paginationDotActive: {
        backgroundColor: 'white',
    },
});

export default ImageCarousel;