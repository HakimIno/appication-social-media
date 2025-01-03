import React from 'react';
import { StyleSheet, Text, Pressable, View, Dimensions } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = 160;
const MENU_ITEM_HEIGHT = 44;
const ARROW_SIZE = 8;

interface MessageOptionsMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    onDelete: () => void;
    onCopy: () => void;
    onClose: () => void;
    theme: any;
}

const MessageOptionsMenu: React.FC<MessageOptionsMenuProps> = ({
    isVisible,
    x,
    y,
    onDelete,
    onCopy,
    onClose,
    theme,
}) => {
    if (!isVisible) return null;

    // Calculate menu position to stay within screen bounds
    let menuX = Math.min(Math.max(x - MENU_WIDTH / 2, 16), SCREEN_WIDTH - MENU_WIDTH - 16);
    let menuY = y - (MENU_ITEM_HEIGHT * 2 + 16) - ARROW_SIZE;
    let arrowX = x - menuX - ARROW_SIZE;

    // If menu would go above screen, show it below the touch point
    const showBelow = menuY < 60;
    if (showBelow) {
        menuY = y + ARROW_SIZE;
    }

    return (
        <Pressable style={styles.overlay} onPress={onClose}>
            <Animated.View
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(100)}
                style={[
                    styles.menuContainer,
                    {
                        top: menuY,
                        left: menuX,
                        backgroundColor: theme.cardBackground,
                    },
                ]}
            >
                {/* Arrow */}
                {/* <View
                    style={[
                        styles.arrow,
                        {
                            backgroundColor: theme.cardBackground,
                            top: showBelow ? -ARROW_SIZE : 'auto',
                            bottom: showBelow ? 'auto' : -ARROW_SIZE,
                            left: arrowX,
                            transform: [{ rotate: showBelow ? '45deg' : '225deg' }],
                            shadowColor: theme.textColor,
                        },
                    ]}
                /> */}

                {/* Menu Items */}
                <Pressable
                    style={styles.menuItem}
                    onPress={onCopy}
                    android_ripple={{ color: theme.textColor + '10' }}
                >
                    <Ionicons name="copy-outline" size={20} color={theme.textColor} />
                    <Text style={[styles.menuText, { color: theme.textColor }]}>Copy</Text>
                </Pressable>

                <View style={[styles.separator, { backgroundColor: theme.textColor + '10' }]} />

                <Pressable
                    style={styles.menuItem}
                    onPress={onDelete}
                    android_ripple={{ color: '#ff444420' }}
                >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    <Text style={[styles.menuText, { color: '#ff4444' }]}>Delete</Text>
                </Pressable>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    menuContainer: {
        position: 'absolute',
        width: MENU_WIDTH,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    arrow: {
        position: 'absolute',
        width: ARROW_SIZE * 2,
        height: ARROW_SIZE * 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: MENU_ITEM_HEIGHT,
        paddingHorizontal: 16,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 12,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
    },
});

export default MessageOptionsMenu; 