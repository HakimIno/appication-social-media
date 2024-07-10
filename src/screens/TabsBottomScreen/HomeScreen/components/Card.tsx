import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { HomeNavigationProp } from '..';

const styles = StyleSheet.create({
    root: {
        borderRadius: 15,
        backgroundColor: 'white',
        paddingVertical: 10
    },
    headerContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'

    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 50,
        marginEnd: 8
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 5,
    },
    cardInfo: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    cardTitle: {
        fontWeight: 'bold',
    },
    cardLikes: {
        opacity: 0.35,
        fontSize: 13,
        fontWeight: 'bold',
    },
});


export interface CardProps {
    image: string;
    title: string;
    likes: string;
    navigation: HomeNavigationProp;
    index: number
}


const Card: React.FC<CardProps & ViewProps> = ({
    style,
    image,
    title,
    likes,
    navigation,
    index,
    ...props
}) => {

    const [lastPress, setLastPress] = useState(0);
    const DOUBLE_PRESS_DELAY = 300;

    const handleDoublePress = () => {
        const now = Date.now();
        if (lastPress && (now - lastPress) < DOUBLE_PRESS_DELAY) {
            console.log('Double press detected!');
        } else {
            setLastPress(now);
        }
    };



    return (
        <View style={[styles.root, style]} {...props}>
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => navigation.navigate("profile_details_screen", { image, username: title })}>
                        <Image
                            source={{ uri: image }}
                            style={styles.avatar}
                        />
                    </Pressable>
                    <View>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardLikes}>{likes} likes</Text>
                    </View>
                </View>
                <Ionicons name="ellipsis-vertical" size={20} color="#242424" />
            </View>
            <Pressable style={styles.cardImage} onPress={handleDoublePress}>
                <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
            </Pressable>
            <View style={styles.cardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Ionicons name="heart-outline" size={26} color="black" />
                    <Ionicons name="chatbubble-outline" size={24} color="black" />
                    <Ionicons name="share-outline" size={26} color="black" />
                </View>
            </View>
        </View >
    );
};

export default Card;