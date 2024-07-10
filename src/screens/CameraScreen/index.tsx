import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera'

const CameraScreen = () => {
    const device = useCameraDevice('back')
    const { hasPermission } = useCameraPermission()

    if (!hasPermission) return <View style={styles.container}><Text>Camera not Permission</Text></View>
    if (device == null) return <View><Text>Camera Error</Text></View>

    return (
        <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
        />
    )
}

export default CameraScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white"
    }
})