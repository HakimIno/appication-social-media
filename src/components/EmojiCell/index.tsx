import { Text, TouchableOpacity, Image, TouchableNativeFeedback, TouchableWithoutFeedback, Pressable } from 'react-native'

interface Props {
    emoji: string
    colSize: number
    onPress(): void
}

export const EmojiCell = ({ emoji, colSize, onPress }: Props) => (
    <TouchableOpacity
        style={{ width: colSize, height: colSize, alignItems: 'center', justifyContent: 'center' }}
        onPress={onPress}
    >
        <Image source={{ uri: emoji }} style={{ width: "100%", height: "100%" }} />
    </TouchableOpacity>
)