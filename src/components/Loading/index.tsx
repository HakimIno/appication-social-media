import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Defs, G, LinearGradient, Path, Stop, Svg } from 'react-native-svg';

const Loading = () => {
    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.linear,
                isInteraction: false,
            }),
        ).start();
    }, [rotateValue]);

    const spin = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width="30" height="30" viewBox="0 0 24 24">
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="red" stopOpacity="1" />
                        <Stop offset="100%" stopColor="blue" stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <G fill="url(#grad)">
                    <Path
                        fill="white"
                        d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
                    />
                </G>
            </Svg>
        </Animated.View>
    )
}

export default Loading

const styles = StyleSheet.create({})