import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    Image: {
        width: 274,
        height: 274
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "white",
        width: "70%",
        textAlign: "center",
        marginBottom: 10,
        lineHeight: 49
    },
    body: {
        width: "70%",
        color: "white",
        fontSize: 14,
        lineHeight: 24
    },
    exploreBtn: {
        width: "70%",
        backgroundColor: '#F72585',
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100
    },
    exploreBtnTxt: {
        color: "white",
    },

    headerContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 0.5,
        borderBottomColor: "#e5e7eb",
        paddingBottom: Platform.select({
            ios: 15,
            android: 15,
            default: 0,
        }),
        paddingVertical: Platform.select({
            ios: 0,
            android: 15,
            default: 0,
        })

    },
    subHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    root: {
        flex: 1,
        backgroundColor: "#242424"
    },
    refreshContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 36,
        height: 36,
        marginTop: -18,
        marginLeft: -18,
        borderRadius: 18,
        objectFit: 'contain',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 5,
        backgroundColor: '#F5F5F5',
        borderRadius: 100
    },
    tabBgColor: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        borderRadius: 100
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    separator: {
        height: 10,
    },
    contentContainer: {
        paddingHorizontal: 0.5,
    },
    contentContainerX: {
        position: 'absolute',
        width: '100%',
        top: 0,
    },
    content: {
        padding: 10,
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: 100,

    },
})