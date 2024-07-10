import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import AppNavigation from './AppNavigation'

const Navigation = () => {
    return (
        <NavigationContainer>
            <AppNavigation />
        </NavigationContainer>
    )
}

export default Navigation

const styles = StyleSheet.create({})