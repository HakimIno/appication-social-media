import { View, Text, useWindowDimensions, ScrollView, StyleSheet } from 'react-native'
import React, { FC, useEffect } from 'react'
import ZigzagLines from 'react-native-zigzag-lines'
import ZigzagView from 'src/components/ZigzagView'
import data from 'src/data/data'
import Accordion from 'src/components/Accordion'
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'

const StoreScreen = () => {
    return (
        // <View style={{ flex: 1, backgroundColor: 'rgb(36, 31, 98)' }}>
        //     <View style={{ marginTop: 50, marginHorizontal: 10 }}>
        //         {/* <ZigzagView
        //             backgroundColor="rgb(36, 31, 98)"
        //             surfaceColor="#FFF"

        //         >
        //             <View>
        //                 <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'rgb(36, 31, 98)' }}>Store</Text>
        //                 <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'rgb(36, 31, 98)' }}>Store</Text>
        //                 <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'rgb(36, 31, 98)' }}>Store</Text>
        //                 <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'rgb(36, 31, 98)' }}>Store</Text>
        //             </View>
        //         </ZigzagView> */}



        //     </View>


        // </View>
        <SafeAreaView style={styles.container} edges={['bottom', 'right', 'left']}>
            <LinearGradient
                colors={['rgb(36, 31, 98)', '#4158D0',]}
                start={{ y: 0, x: 0.5 }}
                end={{ y: 1, x: 1 }}
                style={[styles.container]}
            >
                <View style={{ marginTop: 50, marginHorizontal: 10 }}></View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {data.map((value, index) => {
                        return <Accordion value={value} key={index} type={value.type} />;
                    })}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default StoreScreen

