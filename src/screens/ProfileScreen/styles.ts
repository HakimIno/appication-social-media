import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: 10,
        height: 140,
    },
    overlay: {
        width: "100%",
        height: 140,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
    },
    profileContainer: {
        position: 'absolute',
        zIndex: 2,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -37.5 }, { translateY: -37.5 }],
    },
    profileImage: {
        width: 75,
        height: 75,
        borderRadius: 75 / 2,
        borderWidth: 1.5,
        borderColor: "#fff",
    },
    backgroundImage: {
        borderRadius: 15,
    },
    imageBackground: {
        width: "100%",
        height: "100%",
    },
});