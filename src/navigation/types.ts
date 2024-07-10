import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
    bottom_bar: NavigatorScreenParams<BottomBarParamList>;
    theme_screen: undefined;
    notification_screen: undefined;
    language_screen: undefined;
    profile_screen: undefined;
    profile_details_screen: { image: string, username: string };
    image_profile_screen: { image: string, username: string }
    gallery_screen: { index: number, feed: any }
    create_screen: undefined,
    camera_screen: undefined,
    //Auth
    login_screen: undefined
};

export type BottomBarParamList = {
    bottom_bar_home: undefined;
    bottom_bar_search: undefined;
    bottom_bar_create: undefined;
    bottom_bar_message: undefined;
    bottom_bar_account: undefined;
    profile_details_screen: { image: string, username: string };
    create_screen: undefined

    //Auth
    login_screen: undefined
};