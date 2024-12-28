import React, { useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoSliderProps {
    progress: number;
    duration: number;
    onSeek: (value: number) => void;
    onSlidingStart: () => void;
    onSlidingComplete: () => void;
}

export const VideoSlider: React.FC<VideoSliderProps> = ({
    progress,
    duration,
    onSeek,
    onSlidingStart,
    onSlidingComplete,
}) => {
    const sliderWidth = SCREEN_WIDTH - 30;// ปรับขนาดให้พอดีกับพื้นที่ที่มี
    const position = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);
    const lastPosition = useSharedValue(0);
    const scale = useSharedValue(1);

    // คัพเดทตำแหน่งตาม progress
    React.useEffect(() => {
        if (!isDragging.value && duration > 0) {
            const newPosition = (progress / duration) * sliderWidth;
            position.value = withSpring(newPosition, {
                mass: 0.5,        // น้ำหนักน้อยลง ทำให้เคลื่อนที่เร็วขึ้น
                damping: 20,      // แรงต้านน้อย ทำให้ไม่กระเด้ง
                stiffness: 150,   // ความแข็งของสปริง ปานกลาง
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            });
        }
    }, [progress, duration, sliderWidth]);

    // จัดการ Gesture
    const gesture = Gesture.Pan()
        .onStart((e) => {
            isDragging.value = true;
            startX.value = e.absoluteX;
            lastPosition.value = position.value;
            scale.value = withSpring(1.5, {
                mass: 0.3,
                damping: 15,
                stiffness: 150,
            });
            runOnJS(onSlidingStart)();
        })
        .onUpdate((e) => {
            const delta = e.absoluteX - startX.value;
            let newPosition = lastPosition.value + delta;

            // จำกัดค่าให้อยู่ในช่วงที่กำหนด
            newPosition = Math.max(0, Math.min(newPosition, sliderWidth));
            position.value = newPosition;

            // คำนวณและส่งค่า progress แบบ throttle
            const newProgress = (newPosition / sliderWidth) * duration;
            runOnJS(onSeek)(Math.min(newProgress, duration));
        })
        .onEnd(() => {
            isDragging.value = false;
            scale.value = withSpring(1, {
                mass: 0.3,
                damping: 15,
                stiffness: 150,
            });
            runOnJS(onSlidingComplete)();
        });

    // Animated Styles
    const progressStyle = useAnimatedStyle(() => ({
        width: position.value,
        backgroundColor: isDragging.value ? '#FF4040' : '#FFFFFF',
    }));

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: position.value - 8 },
            { scale: scale.value }
        ],
        opacity: isDragging.value ? 1 : 0,
    }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <View style={styles.sliderContainer}>
                    <View style={styles.track}>
                        <Animated.View style={[styles.progress, progressStyle]} />
                    </View>
                    <Animated.View style={[styles.thumb, thumbStyle]} />
                </View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 200,
    },
    sliderContainer: {
        height: 40,
        justifyContent: 'center',
        width: '100%',
    },
    track: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 1.5,
    },
    thumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        top: 12,
        marginLeft: -8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
}); 