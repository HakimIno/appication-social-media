import React, { PropsWithChildren } from 'react'
import {
    StyleProp,
    StyleSheet,
    View,
    type ViewStyle,
} from 'react-native'
import {
    GestureDetector,

} from 'react-native-gesture-handler'
import Animated, {
    AnimatableValue,
    AnimationCallback,

} from 'react-native-reanimated'

import { AnimationConfigProps, useZoomGesture } from 'src/hooks/useZoomGesture'

export default function Zoom(
    props: PropsWithChildren<ZoomProps>
): React.JSX.Element {
    const { style, contentContainerStyle, children, ...rest } = props

    const {
        zoomGesture,
        onLayout,
        onLayoutContent,
        contentContainerAnimatedStyle,
    } = useZoomGesture({
        ...rest,
    })

    return (
        <GestureDetector gesture={zoomGesture}>
            <View
                style={[styles.container, style]}
                onLayout={onLayout}
                collapsable={false}
            >
                <Animated.View
                    style={[contentContainerAnimatedStyle, contentContainerStyle]}
                    onLayout={onLayoutContent}
                >
                    {children}
                </Animated.View>
            </View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
})

export interface ZoomProps {
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    animationConfig?: AnimationConfigProps;
    doubleTapConfig?: {
        defaultScale?: number;
        minZoomScale?: number;
        maxZoomScale?: number;
    };

    animationFunction?<T extends AnimatableValue>(
        toValue: T,
        userConfig?: AnimationConfigProps,
        callback?: AnimationCallback,
    ): T;
}