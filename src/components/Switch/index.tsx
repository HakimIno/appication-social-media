import { StyleSheet, TouchableWithoutFeedback, Vibration, View } from "react-native"
import Animated, {
    interpolateColor,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    useDerivedValue
} from "react-native-reanimated";
import { useEffect } from "react";
import { Path, Svg } from "react-native-svg";

interface Props {
    size: number;
    isActive: boolean;
    onPress: () => void;
}

export const Switch = ({ isActive = false, size = 24, onPress }: Props) => {
    const switchTranslate = useSharedValue(0);
    const progress = useDerivedValue(() => {
        return withTiming(isActive ? 20 : 0);
    })
    const backgroundColorStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(progress.value, [0, 20], ["#d1d5db", "#4338ca"]);
        return {
            backgroundColor,
        };
    });

    const customSpringStyle = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: withSpring(switchTranslate.value, {
                    mass: 0.7,
                    damping: 15,
                    stiffness: 120,
                    overshootClamping: false,
                    restSpeedThreshold: 0.001,
                    restDisplacementThreshold: 0.001
                })
            }]
        };
    });

    useEffect(() => {
        if (isActive) {
            switchTranslate.value = 19
        } else {
            switchTranslate.value = 4
        }
    }, [isActive, switchTranslate]);


    return (
        <TouchableWithoutFeedback onPressOut={() => Vibration.vibrate(15)} onPressIn={() => Vibration.vibrate(25)} onPress={onPress}>
            <Animated.View style={[styles.contaner, backgroundColorStyle, { width: size + 24, height: size + 8, borderRadius: size + 26 }]}>
                <Animated.View style={[styles.circle, customSpringStyle, { width: size + 1, height: size + 1, borderRadius: size + 1 }]} >
                    {isActive ? (
                        // <Octicons name="check" size={size - 4} color={"#"} />
                        <Svg width={size - 4} height={size - 4} viewBox="0 0 12 12">
                            <Path
                                fill={"#4338ca"}
                                fillRule="evenodd"
                                d="M9.53 3.22a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 011.06-1.06l.97.97 3.97-3.97a.75.75 0 011.06 0"
                                clipRule="evenodd"
                            />
                        </Svg>
                    ) : (
                        <Svg width={size - 4} height={size - 4} viewBox="0 0 16 16" >
                            <Path fill={"#d1d5db"} d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94z" />
                        </Svg>
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback >
    )
}

const styles = StyleSheet.create({
    contaner: {
        justifyContent: 'center',
        borderRadius: 40
    },
    circle: {
        backgroundColor: "white",
        justifyContent: 'center',
        alignItems: 'center'
    }
})