import React from "react";
import { Path, Svg } from "react-native-svg";

interface SvgIconProps {
    path: string;
    color: string;
    size: number;
    stroke: number;
}

export const SvgIcon: React.FC<SvgIconProps> = ({
    path,
    color,
    size,
    stroke
}) => {
    return (
        <>
            <Svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width={size}
                height={size}
                color={color}
                strokeWidth={stroke}
                stroke={color}
            >
                <Path
                    fillRule="evenodd"
                    d={path}
                    clipRule="evenodd"
                />
            </Svg>
        </>
    )
}

