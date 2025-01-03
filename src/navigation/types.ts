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
    preview_screen: {
        selectedMedia: {
            uri: string;
            type: 'video' | 'image';
            width?: number;
            height?: number;
        };
    };
    chat_conversation: {
        user: {
            id: string;
            name: string;
            avatar: string;
            isOnline: boolean;
        }
    };
    call_screen: {
        user: {
            id: string;
            name: string;
            avatar: string;
            isOnline: boolean;
        };
        type: 'voice' | 'video';
    };
    //Auth
    authenticated: undefined
    login_screen: undefined
};

export type BottomBarParamList = {
    bottom_bar_home: undefined;
    bottom_bar_search: undefined;
    bottom_bar_create: undefined;
    bottom_bar_message: undefined;
    bottom_bar_account: undefined;
    profile_details_screen: { image: string, username: string };
    create_screen: undefined;
    chat_conversation: {
        user: {
            id: string;
            name: string;
            avatar: string;
            isOnline: boolean;
        }
    };

    //Auth
    login_screen: undefined
};
