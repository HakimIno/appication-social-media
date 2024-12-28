export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const generateThumbnail = async (player: any, time: number): Promise<string | null> => {
    if (!player) return null;

    try {
        const frame = await player.getFrameAsync(time * 1000);
        return frame.uri;
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        return null;
    }
};