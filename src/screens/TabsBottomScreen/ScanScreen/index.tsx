import { View, Text, Alert, Button, StatusBar, StyleSheet, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { Path, Svg } from 'react-native-svg';
import * as Brightness from 'expo-brightness';

const { width, height } = Dimensions.get('screen');

const ScanScreen = () => {
    const cameraRef = useRef(null);
    const [permission, requestCameraPermissions] = useCameraPermissions();

    useFocusEffect(
        React.useCallback(() => {
            let originalBrightness = 1;

            const handlePermissionRequest = async () => {
                await requestCameraPermissions();
                const { status } = await Brightness.requestPermissionsAsync();
                if (status === 'granted') {
                    originalBrightness = await Brightness.getSystemBrightnessAsync();
                    // await Brightness.setSystemBrightnessAsync(0.8);
                }
            };

            handlePermissionRequest();
            return async () => {
                await Brightness.setSystemBrightnessAsync(originalBrightness);
            };
        }, [])
    );



    const handleBarcodeScanned = ({ data }: any) => {
        console.log('Scanned QR code:', data);
        // You can handle the scanned QR code data here
    };

    const insets = useSafeAreaInsets();


    return (
        <View style={{ flex: 1, }}>
            <StatusBar
                backgroundColor="transparent"
                translucent
                barStyle={"light-content"}
            />
            <View
                style={{
                    position: 'absolute',
                    top: insets.top,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 999,
                    // backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 20
                }}>
                <View style={{ width: "100%", flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', }}>
                    <Ionicons name="flash-off" size={28} color="white" />
                    <Text style={{
                        color: "white", fontSize: 20,
                        fontWeight: "bold",
                    }}>
                        SCAN
                    </Text>
                    <MaterialIcons name="qr-code-scanner" size={28} color="white" />
                </View>
            </View>

            <View
                style={{
                    position: 'absolute',
                    top: height * 0.195,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 9,
                }}>
                {/* <Ionicons name="scan" size={400} color="white" /> */}

                <Svg
                    width={width}
                    height={height * 0.5}
                    viewBox="0 0 512 512"
                >
                    <Path
                        fill="none"
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={8}
                        d="M342 444h46a56 56 0 0 0 56-56v-46m0-172v-46a56 56 0 0 0-56-56h-46M170 444h-46a56 56 0 0 1-56-56v-46m0-172v-46a56 56 0 0 1 56-56h46"
                    />
                </Svg>
            </View>
            <View
                style={{
                    position: 'absolute',
                    top: "50%",
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 99
                }}>
                <View style={{
                    width: width * 0.8,
                    height: 2,
                    backgroundColor: "rgb(121, 45, 129)",
                    borderRadius: 20
                }} />
            </View>



            {/* Semi-transparent background */}

            {/* CameraView */}
            {/* <CameraView
                style={{ flex: 1 }}
                ref={cameraRef}
                onBarcodeScanned={handleBarcodeScanned}
            /> */}
        </View >
    )
}

export default ScanScreen