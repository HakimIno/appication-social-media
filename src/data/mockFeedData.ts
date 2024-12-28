// src/data/mockFeedData.ts

import { faker } from '@faker-js/faker';

export interface FeedItem {
    id: string;
    images: string[];
    video?: string;
    isVideo: boolean;
    thumbnail?: string[];
    likes: number;
    comments: number;
    title: string;
    description: string;
    createdAt: string;
    location?: string;
}

const PICSUM_CATEGORIES = [
    'nature',
    'people',
    'tech',
    'architecture',
    'animals'
];

interface VideoData {
    videoUrl: string;
    thumbnailUrl: string;
}

const SAMPLE_VIDEOS: VideoData[] = [
    {
        videoUrl: 'https://pub-11496457277242a8b2070cbd977c20ef.r2.dev/Snaptik.app_7416728348488961287.mp4',
        thumbnailUrl: "https://pub-11496457277242a8b2070cbd977c20ef.r2.dev/video-capture-0.00seg-9233.png"
    },
    {
        videoUrl: 'https://pub-11496457277242a8b2070cbd977c20ef.r2.dev/SnapTik_App_7435665474622393601-HD.mp4',
        thumbnailUrl: "https://pub-11496457277242a8b2070cbd977c20ef.r2.dev/video-capture-0.00seg-4637.png"
    },
    {
        videoUrl: 'https://pub-11496457277242a8b2070cbd977c20ef.r2.dev/SnapTik_App_7451415544504405266-HD.mp4',
        thumbnailUrl: "https://pub-11496457277242a8b2070cbd977c20ef.r2.dev/video-capture-0.00seg-4833.png"
    },
];

const getPicsumUrl = (width: number, height: number, seed?: number): string => {
    const seedParam = seed ? `?random=${seed}` : '';
    return `https://picsum.photos/${width}/${height}${seedParam}`;
};

interface ImageUrls {
    original: string;
    thumbnail: string;
}

const generateThumbnailRandomImages = (count: number = 1): ImageUrls[] => {
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000000);

    return Array.from({ length: count }, (_, index) => {
        const uniqueSeed = `${timestamp}-${randomSeed}-${index}`;
        const originalWidth = 1080;
        const originalHeight = 1080;
        const thumbnailWidth = 640;
        const thumbnailHeight = 360;

        return {
            original: `https://picsum.photos/${originalWidth}/${originalHeight}?random=${uniqueSeed}`,
            thumbnail: `https://picsum.photos/${thumbnailWidth}/${thumbnailHeight}?random=${uniqueSeed}`
        };
    });
};

const createMockFeedItem = (index: number): FeedItem => {
    const randomVideoData = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
    const isVideo = Math.random() > 0.9;
    const numberOfImages = Math.floor(Math.random() * 4) + 1;

    const imageUrls = generateThumbnailRandomImages(numberOfImages);

    return {
        id: faker.string.uuid(),
        images: isVideo ? [randomVideoData.thumbnailUrl] : imageUrls.map(item => item.original),
        video: isVideo ? randomVideoData.videoUrl : undefined,
        thumbnail: isVideo ? [randomVideoData.thumbnailUrl] : imageUrls.map(item => item.thumbnail),
        isVideo,
        title: faker.string.sample(),
        likes: faker.number.int({ min: 10, max: 1000 }),
        comments: faker.number.int({ min: 0, max: 100 }),
        description: faker.lorem.sentence(),
        createdAt: faker.date.recent().toISOString(),
        location: faker.location.city()
    };
};

export const generateMockFeed = (count: number = 30): FeedItem[] => {
    return Array.from({ length: count }, (_, index) => createMockFeedItem(index));
};

export const generateMockGridFeed = (rows: number = 10): FeedItem[] => {
    const titleTypes = [
        faker.company.catchPhrase(),
        `${faker.word.adjective()} ${faker.word.noun()}`,
        faker.lorem.sentence(3),
        `#${faker.word.sample()} ${faker.word.sample()}`
    ];

    return Array.from({ length: rows * 5 }, (_, index) => {
        const isVideo = Math.random() > 0.9;
        const randomVideoData = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
        const randomTitleType = titleTypes[Math.floor(Math.random() * titleTypes.length)];
        const numberOfImages = Math.floor(Math.random() * 4) + 1;
        const imageUrls = generateThumbnailRandomImages(numberOfImages);

        return {
            id: faker.string.uuid(),
            images: isVideo ? [randomVideoData.thumbnailUrl] : imageUrls.map(item => item.original),
            video: isVideo ? randomVideoData.videoUrl : undefined,
            thumbnail: isVideo ? [randomVideoData.thumbnailUrl] : imageUrls.map(item => item.thumbnail),
            isVideo,
            likes: faker.number.int({ min: 10, max: 1000 }),
            comments: faker.number.int({ min: 0, max: 100 }),
            title: randomTitleType,
            description: faker.lorem.sentence(),
            createdAt: faker.date.recent().toISOString(),
            location: faker.location.city()
        };
    });
};

export const generateMockStories = (count: number = 10) => {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        username: faker.internet.userName(),
        avatar: getPicsumUrl(150, 150, Math.random()),
        hasStory: faker.datatype.boolean(),
        isViewed: faker.datatype.boolean()
    }));
};

export const mockFeedData = generateMockFeed();
export const mockGridFeedData = generateMockGridFeed();
export const mockStories = generateMockStories();

const DEMO_FEED = mockGridFeedData;