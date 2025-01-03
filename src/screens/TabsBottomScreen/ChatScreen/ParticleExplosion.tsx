import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    withTiming, 
    withSequence,
    withDelay,
    runOnJS,
    withSpring,
    Easing
} from 'react-native-reanimated';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface Props {
    x: number;
    y: number;
    color: string;
    width: number;
    height: number;
    onComplete: () => void;
}

interface Particle {
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
    scale: SharedValue<number>;
    opacity: SharedValue<number>;
    rotate: SharedValue<number>;
    color: string;
}

const NUM_PARTICLES = 12;
const PARTICLE_SIZE = 4;

// สีสันสดใสที่จะใช้สำหรับอนุภาค
const PARTICLE_COLORS = [
    '#FF6B6B', // สีแดงสดใส
    '#4ECDC4', // สีเขียวมิ้นท์
    '#FFE66D', // สีเหลืองสดใส
    '#6C5CE7', // สีม่วงสดใส
    '#A8E6CF', // สีเขียวพาสเทล
    '#FF8B94', // สีชมพูอ่อน
];

const ParticleExplosion: React.FC<Props> = ({ x, y, color, width, height, onComplete }) => {
    const particles: Particle[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
            translateX: useSharedValue(0),
            translateY: useSharedValue(0),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            rotate: useSharedValue(0),
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
    }

    useEffect(() => {
        particles.forEach((particle, index) => {
            const angle = (index / NUM_PARTICLES) * Math.PI * 2;
            const velocity = Math.random() * 150 + 80;
            const distance = Math.random() * 80 + 40;

            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            const rotation = (Math.random() - 0.5) * 270;

            const springConfig = {
                damping: 12,
                mass: 0.5,
                stiffness: 100,
            };

            particle.translateX.value = withSpring(targetX * 1.2, springConfig);
            particle.translateY.value = withSpring(targetY * 1.2, springConfig);
            particle.scale.value = withTiming(0, {
                duration: 600,
                easing: Easing.out(Easing.quad),
            });
            particle.opacity.value = withTiming(0, {
                duration: 600,
                easing: Easing.out(Easing.quad),
            });
            particle.rotate.value = withSpring(rotation, springConfig);
        });

        const timeout = setTimeout(() => {
            runOnJS(onComplete)();
        }, 1000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {particles.map((particle, index) => {
                const style = useAnimatedStyle(() => ({
                    position: 'absolute',
                    width: PARTICLE_SIZE,
                    height: PARTICLE_SIZE,
                    backgroundColor: particle.color,
                    borderRadius: PARTICLE_SIZE / 2,
                    left: x - PARTICLE_SIZE / 2,
                    top: y - PARTICLE_SIZE / 2,
                    transform: [
                        { translateX: particle.translateX.value },
                        { translateY: particle.translateY.value },
                        { scale: particle.scale.value },
                        { rotate: `${particle.rotate.value}deg` }
                    ],
                    opacity: particle.opacity.value,
                }));

                return <Animated.View key={index} style={style} />;
            })}
        </>
    );
};

export default ParticleExplosion;