import React, { useEffect, useReducer, useRef } from 'react'
import {
    Pressable,
    StyleSheet,
    Text,
    LayoutChangeEvent,
} from 'react-native'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import Animated, { Easing, ReduceMotion, useAnimatedStyle, withTiming } from 'react-native-reanimated'

type TabBarComponentProps = {
    active?: boolean
    options: BottomTabNavigationOptions
    onLayout: (e: LayoutChangeEvent) => void
    onPress: () => void
}

export const TabBarComponent = ({ active, options, onLayout, onPress }: TabBarComponentProps) => {
    // handle lottie animation -----------------------------------------
    const ref = useRef(null)

    useEffect(() => {
        if (active && ref?.current) {
            // @ts-ignore
            ref.current.play()
        }
    }, [active])

    // animations ------------------------------------------------------

    const animatedComponentCircleStyles = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withTiming(active ? 1 : 0, {
                        duration: 250,
                        easing: Easing.ease,
                        reduceMotion: ReduceMotion.System,
                    })
                }
            ]
        }
    })


    return (
        <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
            <Animated.View
                style={[styles.componentCircle, animatedComponentCircleStyles]}
            />
            <Animated.View style={[styles.iconContainer]}>
                {/* @ts-ignore */}
                {options.tabBarIcon ? options.tabBarIcon({ ref }) : <Text>?</Text>}
            </Animated.View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    component: {
        height: 60,
        width: 60,
    },
    componentCircle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 5,
        width: 60,
        borderRadius: 10,
        backgroundColor: "rgb(36, 31, 98)",
    },
    iconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
})
