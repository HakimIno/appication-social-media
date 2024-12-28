import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    useDerivedValue,
    withTiming,
    Easing,
    withRepeat,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
    uri: string;
    style?: any;
    autoPlay?: boolean;
    isVisible?: boolean;
    onError?: (error: any) => void;
}

const LoadingAnimation = () => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        // Rotation animation
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1
        );

        // Pulse animation
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, {
                    duration: 800,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                withTiming(0.8, {
                    duration: 800,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                })
            ),
            -1,
            true
        );
    }, []);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: scale.value }
            ],
        };
    });

    return (
        <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingCircle]}>
                {/* <LinearGradient
                    colors={['#FF4B8A', '#Fcf', '#FFA07A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                /> */}
                <ActivityIndicator size={60} color="white" />
            </Animated.View>
            <View style={styles.innerCircle} />
        </View>
    );
};

// Main VideoPlayer Component
const VideoPlayer: React.FC<VideoPlayerProps> = ({
    uri,
    style,
    autoPlay = true,
    isVisible = true,
    onError,
}) => {
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const isMounted = useRef(true);
    const controlsTimeout = useRef<NodeJS.Timeout>();
    const playerRef = useRef<any>(null);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const originX = useSharedValue(0);
    const originY = useSharedValue(0);

    // Cleanup function
    const cleanupVideo = useCallback(async () => {
        isMounted.current = false;
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        if (playerRef.current) {
            try {
                await playerRef.current.pause();
                await playerRef.current.unloadAsync();
                playerRef.current = null;
            } catch (error) {
                onError?.(error);
            }
        }
    }, []);

    // Initialize video player
    const videoPlayer = useVideoPlayer(uri, player => {
        if (player && isMounted.current) {
            try {
                playerRef.current = player;
                player.staysActiveInBackground = false;
                player.loop = autoPlay;
                player.timeUpdateEventInterval = 0.1;
                player.muted = isMuted;
                setIsLoaded(true);
            } catch (error) {
                onError?.(error);
            }
        }
    });

    useEffect(() => {
        if (playerRef.current && isLoaded) {
            try {
                if (isVisible) {
                    playerRef.current.play();
                    setIsPlaying(true);
                } else {
                    playerRef.current.pause();
                    playerRef.current.setPositionAsync(0);
                    setIsPlaying(false);
                }
            } catch (error) {
                onError?.(error);
            }
        }
        return () => {
            if (!isVisible) {
                cleanupVideo();
            }
        };
    }, [isVisible, isLoaded]);

    useEffect(() => {
        if (videoPlayer) {
            let timeUpdateSubscription: any;
            let statusSubscription: any;

            try {
                timeUpdateSubscription = videoPlayer.addListener('timeUpdate', ({ currentTime }) => {
                    if (!isSeeking && isMounted.current) {
                        setCurrentTime(currentTime);
                    }
                });

                statusSubscription = videoPlayer.addListener('statusChange', ({ status, error }) => {
                    if (isMounted.current) {
                        switch (status) {
                            case 'loading':
                                setIsBuffering(true);
                                break;
                            case 'readyToPlay':
                                if (videoPlayer.duration > 0) {
                                    setDuration(videoPlayer.duration);
                                    setIsBuffering(false);
                                }
                                break;
                            case 'error':
                                setIsBuffering(false);
                                onError?.(error);
                                break;
                        }
                    }
                });

            } catch (error) {
                onError?.(error);
            }

            return () => {
                try {
                    timeUpdateSubscription?.remove();
                    statusSubscription?.remove();
                } catch (error) {
                }
            };
        }
    }, [videoPlayer, isSeeking, isVisible]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupVideo();
        };
    }, []);

    // Handle video press to show/hide controls
    const handleVideoPress = useCallback(() => {
        setShowControls(prev => !prev);
    }, []);

    // Handle seeking
    const handleSeek = useCallback(async (value: number) => {
        if (videoPlayer) {
            try {
                videoPlayer.currentTime = value;
                setCurrentTime(value);
            } catch (error) {
                onError?.(error);
            }
        }
    }, [videoPlayer]);


    const handleTap = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // Tap gesture for showing/hiding controls
    const tapGesture = Gesture.Tap()
        .onStart(() => {
            runOnJS(handleVideoPress)();
        })
        .shouldCancelWhenOutside(true);


    const SPRING_CONFIG = {
        damping: 15,
        mass: 0.5,
        stiffness: 100,
    };

    const resetTransform = () => {
        'worklet';
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };
    // สร้าง pinch gesture
    const pinchGesture = Gesture.Pinch()
        .onStart((e) => {
            originX.value = e.focalX;
            originY.value = e.focalY;
        })
        .onUpdate((e) => {
            const newScale = Math.min(Math.max(savedScale.value * e.scale, 1), 5);
            scale.value = newScale;

            if (scale.value > 1) {
                const moveX = (e.focalX - originX.value) / scale.value;
                const moveY = (e.focalY - originY.value) / scale.value;
                translateX.value = savedTranslateX.value + moveX;
                translateY.value = savedTranslateY.value + moveY;
            }
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
            resetTransform();
        });

    // สร้าง pan gesture สำหรับเลื่อน video เมื่อ zoom
    const panGesture = Gesture.Pan()
        .enabled(scale.value > 1)
        .onUpdate((e) => {
            if (scale.value > 1) {
                const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
                const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

                translateX.value = Math.min(
                    Math.max(savedTranslateX.value + e.translationX / scale.value, -maxTranslateX),
                    maxTranslateX
                );
                translateY.value = Math.min(
                    Math.max(savedTranslateY.value + e.translationY / scale.value, -maxTranslateY),
                    maxTranslateY
                );
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const composed = Gesture.Simultaneous(tapGesture, pinchGesture, panGesture);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ]
        };
    });

    useEffect(() => {
        if (videoPlayer) {
            try {
                videoPlayer.muted = isMuted;
            } catch (error) {
                onError?.(error);
            }
        }
    }, [isMuted, videoPlayer]);

    useEffect(() => {
        if (videoPlayer) {
            const statusSubscription = videoPlayer.addListener('statusChange', ({ status, error }) => {
                if (status === 'loading') {
                    setIsBuffering(true); // Show loading UI
                } else if (status === 'readyToPlay') {
                    setIsBuffering(false); // Hide loading UI
                } else if (status === 'error') {
                    onError?.(error); // Handle error
                }
            });

            return () => {
                statusSubscription?.remove(); // Clean up subscription
            };
        }
    }, [videoPlayer]);


    const GetSlider = useMemo(
        () => (
            <View style={styles.controls}>
                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={currentTime}
                        onSlidingStart={() => setIsSeeking(true)}
                        onValueChange={handleSeek}
                        onSlidingComplete={() => setIsSeeking(false)}
                        minimumTrackTintColor="#FFFFFF"
                        maximumTrackTintColor="rgba(255,255,255,0.2)"
                        thumbTintColor="#FFFFFF"
                    />

                </View>
            </View>
        ),
        [
            duration,
            currentTime,
            handleSeek
        ],
    );

    return (
        <View style={[styles.container, style]}>
            <StatusBar style="light" backgroundColor="transparent" translucent />
            <GestureDetector gesture={composed}>
                <Animated.View style={[styles.videoContainer, rStyle]}>
                    {(isBuffering || !isLoaded) && <LoadingAnimation />}
                    <VideoView
                        player={videoPlayer}
                        style={[styles.video, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
                        nativeControls={false}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                        shouldRasterizeIOS={true}
                        removeClippedSubviews={true}
                    />
                </Animated.View>
            </GestureDetector>

            {showControls && (
                <TouchableOpacity style={styles.volumeIconContainer} onPress={handleTap}>
                    <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={32}
                        color="white"
                    />
                </TouchableOpacity>
            )}

            {GetSlider}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        aspectRatio: 9 / 16,
    },
    controls: {
        position: 'absolute',
        bottom: 75,
        left: 0,
        right: 0,
        paddingVertical: 10,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        width: '100%',
    },
    timeText: {
        color: 'white',
        fontSize: 12,
        minWidth: 45,
        textAlign: 'center',
    },
    sliderContainer: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    sliderTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        position: 'relative',
        width: '100%',
    },
    sliderFill: {
        height: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        position: 'absolute',
        left: 0,
    },
    sliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        top: -8,
        left: -10,
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    shimmerContainer: {
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
        zIndex: 1000,
    },
    shimmer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        transform: [{ skewX: '-20deg' }],
    },
    volumeIconContainer: {
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: [{ translateX: -16 }, { translateY: -16 }],
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 13,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    loadingContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
    },
    loadingCircle: {
        padding: 5,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    innerCircle: {
        position: 'absolute',
        width: 65,
        height: 65,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
});


export default VideoPlayer;