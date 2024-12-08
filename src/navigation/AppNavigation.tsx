import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import BottomBarTab from './BottomBarTab';
import { CameraScreen, GalleryScreen, ImageProfileScreen, LanguageScreen, LoginScreen, NotificationScreen, PreviewScreen, ProfileDetailsScreen, ProfileScreen, ThemeScreen } from 'src/screens';
import { StackNavigationOptions } from '@react-navigation/stack';
import { AuthContext } from 'src/contexts/auth.context';
import { CreateScreen } from 'src/screens/TabsBottomScreen';

const AppStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const [isTest] = useState(true)
    const AppStackOptions = (title: string): StackNavigationOptions => {
        return {
            headerShown: false,
            headerTitle: title,
            headerTitleAlign: 'center',
            headerTitleStyle: {
                fontSize: 18,
                fontFamily: 'LINESeedSansTH_A_Bd',
            },
            headerStyle: {
                backgroundColor: '#f2f2f2',
            },
        };
    };
    return (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
            {true ? (
                <>
                    <AppStack.Screen name="bottom_bar" component={BottomBarTab} />

                    <AppStack.Screen
                        name="profile_details_screen"
                        component={ProfileDetailsScreen}
                        options={{
                            headerShown: false,
                            animation: "slide_from_right"
                        }}
                    />
                    <AppStack.Screen
                        name="image_profile_screen"
                        component={ImageProfileScreen}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                            animation: "fade"
                        }}
                    />
                    <AppStack.Screen
                        name="gallery_screen"
                        component={GalleryScreen}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                            animation: "ios"
                        }}
                    />

                    {/* seting */}
                    <AppStack.Screen
                        name="theme_screen"
                        component={ThemeScreen}
                    />
                    <AppStack.Screen
                        name="notification_screen"
                        component={NotificationScreen}
                    />
                    <AppStack.Screen
                        name="language_screen"
                        component={LanguageScreen}
                    />
                    <AppStack.Screen
                        name="profile_screen"
                        component={ProfileScreen}
                    />
                    <AppStack.Screen
                        name="create_screen"
                        component={CreateScreen}
                        options={{
                            headerShown: false,
                            presentation: "modal",
                            animation: "fade_from_bottom"
                        }}
                    />
                    <AppStack.Screen
                        name="camera_screen"
                        component={CameraScreen}
                        options={{
                            headerShown: false,
                            presentation: "modal",
                            animation: "fade_from_bottom"
                        }}
                    />

                    <AppStack.Screen
                        name="preview_screen"
                        component={PreviewScreen}
                        options={{
                            headerShown: false,
                            presentation: "card",
                            animation: "slide_from_right"
                        }}
                    />
                </>
            ) : (
                <AppStack.Screen
                    name="login_screen"
                    component={LoginScreen}
                    options={{
                        headerShown: false,
                        animation: "slide_from_bottom"
                    }}
                />
            )}
        </AppStack.Navigator>
    )
}

export default AppNavigation

const styles = StyleSheet.create({})