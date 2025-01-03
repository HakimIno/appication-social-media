import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native'
import React, { useMemo } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Animated, { interpolate, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { FlashList } from '@shopify/flash-list'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const STICKER_SIZE = (SCREEN_WIDTH - 32) / 4

// Calculate keyboard height based on device
const KEYBOARD_HEIGHT = Platform.select({
    ios: SCREEN_HEIGHT * 0.4, // 40% of screen height for iOS
    android: 300, // Fixed height for Android
    default: 300
})

// แยก data ออกมาเป็น constant
const STICKER_CATEGORIES = [
    {
        id: 'recent',
        name: 'ล่าสุด',
        icon: 'time-outline',
        stickers: [
            { id: '1', url: 'https://media.tenor.com/b67is22VGiUAAAAi/utya-utya-duck.gif' },
            { id: '2', url: 'https://media.tenor.com/Z-hrYzd7zvIAAAAi/utya-utya-duck.gif' },
            { id: '3', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
            { id: '4', url: 'https://media.tenor.com/8S28smZQZ7wAAAAi/utya-utya-duck.gif' },
            { id: '5', url: 'https://media.tenor.com/nOWoXPqH7D4AAAAi/utya-telegram.gif' },
            { id: '6', url: 'https://media.tenor.com/_w8QgJp71j4AAAAi/utya-telegram.gif' },
            { id: '7', url: 'https://media.tenor.com/tZc3nOnqpF8AAAAi/utya-utya-duck.gif' },
            { id: '8', url: 'https://media.tenor.com/qksCshcDAacAAAAi/utya-telegram-duck.gif' },
            { id: '9', url: 'https://media.tenor.com/U73ou4Nz8MoAAAAi/utya-telegram-duck.gif' },
            { id: '10', url: 'https://media.tenor.com/6PDwkYCL8GYAAAAi/telegram-utya-telegram-duck.gif' },
            { id: '11', url: 'https://media.tenor.com/5I4hV-vKbOAAAAAi/utya-utya-duck.gif' },
            { id: '12', url: 'https://media.tenor.com/pJJ6uU9vjaAAAAAi/utya-utya-duck.gif' },
            { id: '13', url: 'https://media.tenor.com/YXZL61MYsfYAAAAi/utya-utya-duck.gif' },
            { id: '14', url: 'https://media.tenor.com/8eZe6RXW6F4AAAAi/utya-utya-duck.gif' },
            { id: '15', url: 'https://media.tenor.com/b67is22VGiUAAAAi/utya-utya-duck.gif' },
            { id: '16', url: 'https://media.tenor.com/h796J-dd0FUAAAAi/utya-utya-duck.gif' },
            { id: '17', url: 'https://media.tenor.com/PD3qUz22UxIAAAAi/utya-utya-duck.gif' },
            { id: '18', url: 'https://media.tenor.com/kdfWfHvqvy0AAAAi/utya-utya-duck.gif' },
            { id: '19', url: 'https://media.tenor.com/icPog2Shcm4AAAAi/utya-telegram.gif' },
            { id: '20', url: 'https://media.tenor.com/-I-6w9klVyEAAAAi/utya-telegram.gif' },
            { id: '21', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
            { id: '22', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
            { id: '23', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
            { id: '24', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
            { id: '25', url: 'https://media.tenor.com/YhNac8PQeJwAAAAi/utya-telegram.gif' },
        ]
    },

];

interface StickerType {
    id: string
    url: string
    value?: string
}

interface CategoryTabProps {
    id: string
    name: string
    icon: string
    isSelected: boolean
    theme: any
    onPress: () => void
}

// แยก CategoryTab ออกมาเป็น Component แยก
const CategoryTab: React.FC<CategoryTabProps> = React.memo(({
    id,
    name,
    icon,
    isSelected,
    theme,
    onPress
}) => (
    <Pressable
        style={({ pressed }) => [
            styles.categoryTab,
            isSelected && [
                styles.selectedCategoryTab,
                { backgroundColor: theme.primary + '20' }
            ],
            pressed && { opacity: 0.7 }
        ]}
        onPress={onPress}
    >
        <Ionicons
            name={icon as any}
            size={20}
            color={isSelected ? theme.primary : theme.textColor}
            style={styles.categoryIcon}
        />
        <Text style={[
            styles.categoryText,
            { color: isSelected ? theme.primary : theme.textColor }
        ]}>
            {name}
        </Text>
    </Pressable>
))

interface StickerItemProps {
    item: StickerType
    onPress: (sticker: StickerType) => void
}

// แยก StickerItem ออกมาเป็น Component แยก
const StickerItem: React.FC<StickerItemProps> = React.memo(({ item, onPress }) => (
    <Pressable
        style={({ pressed }) => [
            styles.stickerButton,
            pressed && styles.stickerButtonPressed
        ]}
        onPress={() => onPress(item)}
    >
        <Image
            source={{ uri: item.url }}
            style={styles.stickerImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={item.id}
            placeholder={Platform.select({
                ios: 'BLURHASH',
                android: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
            })}
        />
    </Pressable>
))

interface StickerPickerProps {
    isVisible: boolean
    height: Animated.SharedValue<number>
    theme: any
    onClose: () => void
    onSelectSticker: (sticker: StickerType) => void
}

const StickerPicker: React.FC<StickerPickerProps> = ({
    isVisible,
    height,
    theme,
    onClose,
    onSelectSticker
}) => {
    const [selectedCategory, setSelectedCategory] = React.useState(STICKER_CATEGORIES[0].id)

    // ใช้ useMemo เพื่อ cache stickers ของ category ที่เลือก
    const selectedStickers = useMemo(() =>
        STICKER_CATEGORIES.find(c => c.id === selectedCategory)?.stickers || [],
        [selectedCategory]
    )

    const animatedStyle = useAnimatedStyle(() => ({
        height: interpolate(
            height.value,
            [0, 1],
            [0, KEYBOARD_HEIGHT]
        ),
        transform: [
            {
                translateY: interpolate(
                    height.value,
                    [0, 1],
                    [KEYBOARD_HEIGHT, 0]
                )
            }
        ],
        opacity: height.value
    }))

    // ใช้ useCallback เพื่อ memoize render item function
    const renderSticker = React.useCallback(({ item }: { item: StickerType }) => (
        <StickerItem item={item} onPress={onSelectSticker} />
    ), [onSelectSticker])

    if (!isVisible) return null

    return (
        <Animated.View style={[styles.container, animatedStyle, { backgroundColor: theme.backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: theme.textColor + '20' }]}>
                <Text style={[styles.title, { color: theme.textColor }]}>สติกเกอร์</Text>
                <Pressable
                    onPress={onClose}
                    style={({ pressed }) => [
                        styles.closeButton,
                        { opacity: pressed ? 0.7 : 1 }
                    ]}
                >
                    <Ionicons name="close" size={24} color={theme.textColor} />
                </Pressable>
            </View>

            {/* <FlashList
                data={STICKER_CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={100}
                renderItem={({ item }) => (
                    <CategoryTab
                        id={item.id}
                        name={item.name}
                        icon={item.icon}
                        isSelected={selectedCategory === item.id}
                        theme={theme}
                        onPress={() => setSelectedCategory(item.id)}
                    />
                )}
                contentContainerStyle={styles.categoryTabsContent}
                style={styles.categoryTabs}
            /> */}

            <FlashList
                keyExtractor={item => item.id}
                data={selectedStickers}
                renderItem={renderSticker}
                numColumns={4}
                estimatedItemSize={STICKER_SIZE}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.stickersGridContent}
                style={styles.stickersGrid}
                removeClippedSubviews={true}
                estimatedFirstItemOffset={0}
                drawDistance={STICKER_SIZE * 8}
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 1,
        height: KEYBOARD_HEIGHT, // Set default height
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderBottomWidth: 0.5,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'LINESeedSansTH_A_Bd',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTabs: {
        flexGrow: 0,
        marginVertical: 4, // Reduced vertical margin
        height: 45, // Slightly reduced height
    },
    categoryTabsContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    categoryIcon: {
        opacity: 0.9,
    },
    selectedCategoryTab: {
        backgroundColor: 'transparent',
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'LINESeedSansTH_A_Rg',
    },
    stickersGrid: {
        flex: 1,
        marginTop: 4, // Add small margin top
    },
    stickersGridContent: {
        padding: 4, // Reduced padding
        gap: 2, // Reduced gap
    },
    stickerButton: {
        width: STICKER_SIZE,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2, // Reduced padding
    },
    stickerButtonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.8,
    },
    stickerImage: {
        width: '100%',
        height: '100%',
    },
})

export default React.memo(StickerPicker)