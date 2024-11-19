// src/data/mockFeedData.ts

import { faker } from '@faker-js/faker';

export interface FeedItem {
    id: string;
    image: string;
    likes: number;
    comments: number;
    description: string;
    createdAt: string;
    location?: string;
}

// สร้าง categories สำหรับรูปภาพที่แตกต่างกัน
const PICSUM_CATEGORIES = [
    'nature',
    'people',
    'tech',
    'architecture',
    'animals'
];

// ฟังก์ชันสร้าง Picsum URL with seed
const getPicsumUrl = (width: number, height: number, seed?: number): string => {
    const seedParam = seed ? `?random=${seed}` : '';
    return `https://picsum.photos/${width}/${height}${seedParam}`;
};

// ฟังก์ชันสร้าง mock feed item
const createMockFeedItem = (index: number): FeedItem => {
    const seed = Math.floor(Math.random() * 1000);
    return {
        id: faker.string.uuid(),
        image: getPicsumUrl(1080, 1080, seed), // Full HD square image
        likes: faker.number.int({ min: 10, max: 1000 }),
        comments: faker.number.int({ min: 0, max: 100 }),
        description: faker.lorem.sentence(),
        createdAt: faker.date.recent().toISOString(),
        location: faker.location.city()
    };
};

// ฟังก์ชันสร้าง mock data ทั้งหมด
export const generateMockFeed = (count: number = 30): FeedItem[] => {
    return Array.from({ length: count }, (_, index) => createMockFeedItem(index));
};

// สร้าง mock data แบบ grid layout (3 columns)
export const generateMockGridFeed = (rows: number = 10): FeedItem[] => {
    const titleTypes = [
        faker.company.catchPhrase(),

        `${faker.word.adjective()} ${faker.word.noun()}`,

        faker.lorem.sentence(3),

        `#${faker.word.sample()} ${faker.word.sample()}`
    ];

    const randomTitleType = titleTypes[Math.floor(Math.random() * titleTypes.length)];

    return Array.from({ length: rows * 10 }, (_, index) => ({
        id: faker.string.uuid(),
        image: getPicsumUrl(600, 600, index), // Smaller size for grid
        title: randomTitleType,
        likes: faker.number.int({ min: 10, max: 1000 }),
        comments: faker.number.int({ min: 0, max: 100 }),
        description: faker.lorem.sentence(),
        createdAt: faker.date.recent().toISOString()
    }));
};

// ฟังก์ชันสร้าง mock stories
export const generateMockStories = (count: number = 10) => {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        username: faker.internet.userName(),
        avatar: getPicsumUrl(150, 150, Math.random()),
        hasStory: faker.datatype.boolean(),
        isViewed: faker.datatype.boolean()
    }));
};

// Export mock data ที่พร้อมใช้งาน
export const mockFeedData = generateMockFeed();
export const mockGridFeedData = generateMockGridFeed();
export const mockStories = generateMockStories();

// ตัวอย่างการใช้งานใน ProfileDetailsScreen
const DEMO_FEED = mockGridFeedData;