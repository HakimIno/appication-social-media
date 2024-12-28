declare module 'react-native-pinchable' {
    import { ReactNode } from 'react';
    import { ViewStyle } from 'react-native';

    interface PinchableProps {
        children: ReactNode;
        style?: ViewStyle;
        minScale?: number;
        maxScale?: number;
        onScaleChange?: (scale: number) => void;
        onPinchStart?: () => void;
        onPinchEnd?: () => void;
    }

    export default function Pinchable(props: PinchableProps): JSX.Element;
} 