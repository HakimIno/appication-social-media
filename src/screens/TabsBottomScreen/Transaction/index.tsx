import { View, Text } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import Rainbow from 'src/components/Rainbow'

const Transaction = () => {
    return (
        <View style={{ flex: 1, backgroundColor: "rgb(36, 31, 98)" }}>
            <Rainbow />
        </View>
    )
}

export default Transaction