import { BaseCrawler } from './base';
import * as cheerio from 'cheerio';
import { logger } from '../monitoring/logger';

class UsedCarsCrawler extends BaseCrawler {
    constructor() {
        super({
            name: 'usedcars',
            baseUrl: 'https://www.usedcars.co.ke/cars-for-sale',
            selectors: {
                carContainer: '.row > .col-lg-4, .col-lg-8',
                carTitle: 'h2.strong',
                location: '.fas.fa-map-marker-alt + span',
                fuelType: '.fas.fa-gas-pump + span',
                transmission: '.icon-automatic + span',
                mileage: '.fas.fa-road + span',
                engineSize: '.icon-engine + span',
                driveType: '.icon-racing + span',
                price: '.car-price',
                dutyPaid: '.car-price-duty > span',
                image: '.img-item-inner',
                detailsButton: '.btn-view-detail',
                nextButton: '.pagination .next'
            }
        });
    }

    async crawl(url) {
        if (!this.browser) await this.initialize();

        const page = await this.browser.newPage();
        try {
            logger.info(`Crawling Used Cars page: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

            const listings = await this.extractListings(page);

            for (const listing of listings) {
                const normalizedData = await this.normalizeData(listing);
                await this.save(normalizedData);
            }

            const hasNextPage = await this.checkForNextPage(page);
            if (hasNextPage) {
                const nextPageUrl = await this.getNextPageUrl(page);
                if (nextPageUrl) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await this.crawl(nextPageUrl);
                }
            }
        } catch (error) {
            logger.error(`Error crawling Used Cars page ${url}: ${error.message}`);
            throw error;
        } finally {
            await page.close();
        }
    }

    async extractListings(page) {
        const content = await page.content();
        const $ = cheerio.load(content);
        const listings = [];

        $(this.config.selectors.carContainer).each((_, container) => {
            const $container = $(container);
            const listing = {
                title: $container.find(this.config.selectors.carTitle).text().trim(),
                location: $container.find(this.config.selectors.location).text().trim(),
                fuelType: $container.find(this.config.selectors.fuelType).text().trim(),
                transmission: $container.find(this.config.selectors.transmission).text().trim(),
                mileage: parseInt($container.find(this.config.selectors.mileage).text().replace(/[^0-9]/g, '')) || 0,
                engineSize: parseInt($container.find(this.config.selectors.engineSize).text().replace(/[^0-9]/g, '')) || 0,
                driveType: $container.find(this.config.selectors.driveType).text().trim(),
                price: parseInt($container.find(this.config.selectors.price).text().replace(/[^0-9]/g, '')) || 0,
                dutyPaid: $container.find(this.config.selectors.dutyPaid).text().includes('Duty paid'),
                imageUrl: $container.find(this.config.selectors.image).attr('style')?.match(/url\(&quot;(.*?)&quot;\)/)?.[1] || '',
                detailUrl: $container.find(this.config.selectors.detailsButton).parent().attr('href') || ''
            };

            if (this.isValidListing(listing)) {
                listings.push(listing);
            }
        });

        return listings;
    }

    isValidListing(listing) {
        return listing.title && listing.price > 0 && listing.imageUrl && listing.detailUrl;
    }

    async normalizeData(listing) {
        const titleParts = listing.title.split(' ');
        const year = parseInt(titleParts[1]) || null;
        const make = titleParts[0];
        const model = titleParts.slice(2).join(' ');

        return {
            title: listing.title,
            make,
            model,
            year,
            price: listing.price,
            location: listing.location,
            specs: {
                fuelType: listing.fuelType,
                transmission: listing.transmission,
                mileage: listing.mileage,
                engineSize: listing.engineSize,
                driveType: listing.driveType,
            },
            imageUrl: listing.imageUrl,
            detailUrl: listing.detailUrl,
            dutyPaid: listing.dutyPaid,
        };
    }

    async checkForNextPage(page) {
        const nextButton = await page.$(this.config.selectors.nextButton);
        return !!nextButton && !(await nextButton.evaluate(button => button.classList.contains('disabled')));
    }

    async getNextPageUrl(page) {
        return await page.evaluate((nextBtnSelector) => {
            const nextBtn = document.querySelector(nextBtnSelector);
            return nextBtn ? nextBtn.getAttribute('href') : null;
        }, this.config.selectors.nextButton);
    }
}

export default new UsedCarsCrawler();
