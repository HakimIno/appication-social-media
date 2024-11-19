import { View, Text } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import Rainbow from 'src/components/Rainbow'
import AnimatedText from 'src/components/AnimatedText'

const Transaction = () => {
    return (
        <View style={{ flex: 1, backgroundColor: "white", justifyContent: 'center', alignItems: 'center' }}>
            <AnimatedText text="Loading..." color="#2563eb" />
        </View>
    )
}

export default Transaction