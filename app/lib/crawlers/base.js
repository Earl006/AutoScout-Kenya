import puppeteer from 'puppeteer';
import prisma from "@/app/lib/prisma";
import { normalize } from '../processors/normalizer';
import { deduplicate } from '../processors/deduplicator';
import { logger } from '../monitoring/logger';

export class BaseCrawler {
    constructor(config) {
        this.config = config;
        this.browser = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
    }

    async crawl(url) {
        if (!this.browser) await this.initialize();

        const page = await this.browser.newPage();
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
            await page.close();
        }
    }

    async save(data) {
        // Save to database using Prisma
        return await prisma.car.create({
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