import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Camera, CameraPermissionStatus, CameraProps, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { StatusBar } from 'expo-status-bar';
import Reanimated, { Extrapolation, interpolate, useAnimatedProps, useSharedValue } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import AnimatedText from 'src/components/AnimatedText';

Reanimated.addWhitelistedNativeProps({
    zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)


const CameraScreen = () => {
    const [hasPermission, setHasPermission] = useState<CameraPermissionStatus>('not-determined');
    const [loading, setLoading] = useState(true);
    const device = useCameraDevice('back');
    if (device == null) return (
        <View style={styles.permissionDeniedContainer}>
            <Text style={styles.permissionDeniedText}>
                {hasPermission === 'denied' ? 'Permission denied' : 'No camera device found'}
            </Text>
        </View>
    )
    const cameraRef = useRef<Camera>(null);
    const zoom = useSharedValue(device.neutralZoom)

    const zoomOffset = useSharedValue(0);


    const gesture = Gesture.Pinch()
        .onBegin(() => {
            zoomOffset.value = zoom.value
        })
        .onUpdate(event => {
            const z = zoomOffset.value * event.scale
            zoom.value = interpolate(
                z,
                [1, 10],
                [device.minZoom, device.maxZoom],
                Extrapolation.CLAMP,
            )
        })

    const animatedProps = useAnimatedProps<CameraProps>(
        () => ({ zoom: zoom.value }),
        [zoom]
    )


    useEffect(() => {
        const requestPermission = async () => {
            try {
                const status = await Camera.requestCameraPermission();
                setHasPermission(status);
            } catch (error) {
                console.error('Failed to request camera permission', error);
                setHasPermission('denied');
            } finally {
                setLoading(false);
            }
        };

        requestPermission();
    }, []);


    const renderDetectorContent = () => {
        if (loading) {
            return <AnimatedText text="Loading..." color="#fff" />
            // return <ActivityIndicator size="large" color="white" />;
        }

        if (device && hasPermission === 'granted') {
            return (
                // <Camera
                //     ref={cameraRef}
                //     style={StyleSheet.absoluteFill}
                //     device={device}
                //     isActive={true}
                //     video={true}
                //     audio={true}
                //     resizeMode='cover'

                // />
                <GestureDetector gesture={gesture}>
                    <ReanimatedCamera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        animatedProps={animatedProps}
                    />
                </GestureDetector>
            );
        }

        return (
            <View style={styles.permissionDeniedContainer}>
                <Text style={styles.permissionDeniedText}>
                    {hasPermission === 'denied' ? 'Permission denied' : 'No camera device found'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style='auto' />
            {renderDetectorContent()}
        </View>
    );
};

export default CameraScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    permissionDeniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionDeniedText: {
        color: 'white',
        fontSize: 16,
    },
});
