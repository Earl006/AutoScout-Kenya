import Queue from 'bull';

export const crawlerQueue = new Queue('car-crawler', {
    redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Configure queue settings
crawlerQueue.settings({
    stalledInterval: 300000, // 5 minutes
    maxStalledCount: 3
});

// Add queue processors
crawlerQueue.process(async (job) => {
    const { sourceId, url } = job.data;
    try {
        // Import the appropriate crawler based on sourceId
        const crawler = await import(`../crawlers/${sourceId}.js`);
        await crawler.default.crawl(url);
        return { status: 'success' };
    } catch (error) {
        console.error(`Crawler error for ${sourceId}:`, error);
        throw error;
    }
});