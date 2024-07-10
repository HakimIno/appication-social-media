import React, { useReducer } from 'react'
import {
    StyleSheet,
    View,
    LayoutChangeEvent,
} from 'react-native'
// navigation
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import Animated, { useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'
import { TabBarComponent } from './TabBarComponent'


const AnimatedSvg = Animated.createAnimatedComponent(Svg)

export const AnimatedTabBar = ({ state: { index: activeIndex, routes }, navigation, descriptors }: BottomTabBarProps) => {
    const { bottom } = useSafeAreaInsets()
    const reducer = (state: any, action: { x: number, index: number }) => {
        return [...state, { x: action.x, index: action.index }]
    }
    const [layout, dispatch] = useReducer(reducer, [])
    const handleLayout = (event: LayoutChangeEvent, index: number) => {
        dispatch({ x: event.nativeEvent.layout.x, index })
    }
    // animations ------------------------------------------------------
    const xOffset = useDerivedValue(() => {
        if (layout.length !== routes.length) return 0;
        return [...layout].find(({ index }) => index === activeIndex)!.x - 25
    }, [activeIndex, layout])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            // translateX to the calculated offset with a smooth transition
            transform: [{ translateX: withTiming(xOffset.value, { duration: 250 }) }],
        }
    })

    const getFillColor = (index: number) => {
        switch (index) {
            case 0:
                return "rgb(36, 31, 98)"
            case 1:
                return "rgb(36, 31, 98)"
            case 2:
                return "rgba(0, 0, 0, 0.9)"
            case 3:
                return "rgb(36, 31, 98)"
            case 4:
                return "rgb(36, 31, 98)"
            default:
                break;
        }
    };


    return (
        // { paddingBottom: bottom + 10 }
        <View style={[styles.tabBar, { paddingBottom: bottom - 5 }]}>

            {/* <AnimatedSvg
                width={110}
                height={60}
                viewBox="0 0 110 60"
                style={[styles.activeBackground, animatedStyles]}
            >
                <Path
                    fill={getFillColor(activeIndex)}
                    d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
                />
            </AnimatedSvg> */}

            <View style={styles.tabBarContainer}>
                {routes.map((route, index) => {
                    const active = index === activeIndex
                    const { options } = descriptors[route.key]

                    return (
                        <TabBarComponent
                            key={route.key}
                            active={active}
                            options={options}
                            onLayout={(e) => handleLayout(e, index)}
                            onPress={() => navigation.navigate(route.name)}
                        />
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'white',
    },
    activeBackground: {
        position: 'absolute',
        marginTop: 0
    },
    tabBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
})