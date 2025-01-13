export const metrics = {
    async trackCrawlTime(sourceId, startTime) {
        const duration = Date.now() - startTime;
        await prisma.crawlerLog.create({
            data: {
                sourceId,
                status: 'METRIC',
                message: 'Crawl duration',
                metadata: { duration }
            }
        });
    },

    async trackListingsCount(sourceId, count) {
        await prisma.crawlerLog.create({
            data: {
                sourceId,
                status: 'METRIC',
                message: 'Listings found',
                metadata: { count }
            }
        });
    }
};