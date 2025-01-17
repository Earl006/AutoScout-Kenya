// app/lib/crawlers/base.js
import { browserManager } from '../services/browserManager';
import prisma from "@/app/lib/prisma";
import { normalize } from '../processors/normalizer';
import { deduplicate } from '../processors/deduplicator';
import { logger } from '../monitoring/logger';

export class BaseCrawler {
    constructor(config) {
        this.config = config;
    }

    async initialize() {
        // Get the shared browser instance
        return await browserManager.getBrowser();
    }

    async getBrowser() {
        return await browserManager.getBrowser();
    }

    async crawl(url) {
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            // Set rate limiting
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                // Implement rate limiting logic here
                request.continue();
            });

            await page.goto(url, { waitUntil: 'networkidle0' });

            // Extract data (to be implemented by specific crawlers)
            const rawData = await this.extract(page);

            // Process the data
            const normalizedData = await normalize(rawData);
            const uniqueData = await deduplicate(normalizedData);

            // Save to database
            await this.save(uniqueData);

            // Log success
            logger.info(`Successfully crawled ${url}`);

        } catch (error) {
            logger.error(`Error crawling ${url}: ${error.message}`);
            throw error;
        } finally {
            await page.close().catch(console.error);
        }
    }

    async save(data) {

        console.log('Final carData for Prisma', data);

        // Save to database using Prisma
        return prisma.car.create({
            data: {
                ...data,
                listings: {
                    create: {
                        // listing details
                    }
                }
            }
        });
    }

    // To be implemented by specific crawlers
    async extract(page) {
        throw new Error('Extract method must be implemented by specific crawlers');
    }
}