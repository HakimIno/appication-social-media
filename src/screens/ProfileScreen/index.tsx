import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MainLayout from 'src/components/MainLayout'
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/navigation/types';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "profile_screen">;


const ProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();

    const PROFILE_PICTURE_URI =
        'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/50183164/original/f80714a807d09df88dc708d83941384ac5d9e6dd/draw-nice-style-cartoon-caricature-as-a-profile-picture.png';


    return (
        <MainLayout titile='บัญชี' goBack={() => navigation.goBack()}>
            {/* images */}
            <View style={styles.container}>
                <View style={styles.overlay} />
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: PROFILE_PICTURE_URI }}
                        style={styles.profileImage}
                    />
                </View>
                <ImageBackground
                    resizeMode="cover"
                    imageStyle={styles.backgroundImage}
                    style={styles.imageBackground}
                    source={{ uri: "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg" }}
                />
            </View>
        </MainLayout>
    )
}

export default ProfileScreen
