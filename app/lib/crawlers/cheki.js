import { BaseCrawler } from './base';
import * as cheerio from 'cheerio';
import { logger } from '../monitoring/logger';

class ChekiCrawler extends BaseCrawler {
    constructor() {

        super({
            name: 'cheki',
            baseUrl: 'https://autochek.africa/ke',
            selectors: {
                // Search related selectors
                searchInput: 'input[type="search"]',
                searchButton: 'button#search',

                // Car listing selectors
                carContainer: '.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-sm-6.MuiGrid-grid-md-4',
                carWrapper: '.MuiStack-root.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1',
                carLink: 'a[href*="/ke/car/"]',
                title: 'h6.MuiTypography-root.MuiTypography-h6',
                price: 'p.MuiTypography-root.MuiTypography-body1.css-1bztvjj',
                location: 'span.MuiTypography-root.MuiTypography-caption.css-umr6w4',
                specs: '.MuiChip-root.MuiChip-filled.MuiChip-sizeSmall',
                imageContainer: 'span[style*="display: inline-block"]',
                images: 'img[src*="media.autochek.africa"]',
                imagesAlt: 'img[srcset*="media.autochek.africa"]',
                monthlyPayment: 'h6.MuiTypography-root.MuiTypography-h6.css-186gzpa',

                // Pagination
                nextButton: 'button[aria-label="Next page"]'
            }
        });
    }

    async crawl(url) {
        if (!this.browser) await this.initialize();

        const page = await this.browser.newPage();
        try {
            // Set user agent and viewport
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            await page.setViewport({ width: 1920, height: 1080 });

            // Enable request interception for rate limiting
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                // Block unnecessary resources
                const blockedResources = ['image', 'stylesheet', 'font', 'media'];
                if (blockedResources.includes(request.resourceType())) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            logger.info(`Crawling Cheki page: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

            // Extract data from the current page
            const listings = await this.extractListings(page);

            // Process and save the data
            for (const listing of listings) {
                const normalizedData = await this.normalizeData(listing);
                await this.save(normalizedData);
            }

            // Check for next page
            const hasNextPage = await page.$(this.config.selectors.nextButton);
            if (hasNextPage) {
                const nextPageUrl = await page.evaluate((nextBtnSelector) => {
                    const nextBtn = document.querySelector(nextBtnSelector);
                    return nextBtn ? nextBtn.getAttribute('href') : null;
                }, this.config.selectors.nextButton);

                if (nextPageUrl) {
                    // Add delay before crawling next page
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await this.crawl(nextPageUrl);
                }
            }

        } catch (error) {
            logger.error(`Error crawling Cheki page ${url}: ${error.message}`);
            throw error;
        } finally {
            await page.close();
        }
    }

    async extractListings(page) {
        try {
            const content = await page.content();
            const $ = cheerio.load(content);
            const listings = [];

            console.log('Number of car containers found:', $(this.config.selectors.carContainer).length);

            $(this.config.selectors.carContainer).each((_, container) => {
                const $container = $(container);

                // Verify we have a car wrapper inside
                const $carWrapper = $container.find(this.config.selectors.carWrapper);
                if (!$carWrapper.length) return;

                // Extract price - handle both full price and monthly payment
                const fullPrice = this.extractPrice($carWrapper, this.config.selectors.price);
                const monthlyPayment = this.extractPrice($carWrapper, this.config.selectors.monthlyPayment);

                const listing = {
                    title: this.extractText($carWrapper, this.config.selectors.title),
                    price: fullPrice,
                    monthlyPayment: monthlyPayment,
                    location: this.extractLocation($carWrapper),
                    specs: this.extractSpecs($, $carWrapper),
                    images: this.extractImages($carWrapper, $),
                    url: this.extractUrl($carWrapper),
                    externalId: this.extractExternalId($carWrapper)
                };

                if (this.isValidListing(listing)) {
                    listings.push(listing);
                    console.log('Found valid listing:', listing);
                } else {
                    console.log('Invalid listing found:', listing);
                }
            });

            console.log(`Total listings found: ${listings.length}`);
            return listings;
        } catch (error) {
            logger.error(`Error extracting listings: ${error.message}`);
            return [];
        }
    }

    extractLocation($element) {
        try {
            const location = $element.find(this.config.selectors.location).first().text().trim();
            // Sometimes location includes additional text, let's clean it
            return location.split(',').map(part => part.trim()).join(', ');
        } catch (error) {
            return '';
        }
    }

    extractText(element, selector) {
        try {
            return element.find(selector).first().text().trim();
        } catch (error) {
            return '';
        }
    }

    extractPrice(element, selector) {
        try {
            const priceText = element.find(selector).first().text().trim();
            // Handle both formats: "KSh 1,015,000" and "KSh 45,252 / Mo"
            const numericPart = priceText.replace(/[^0-9.]/g, '');
            return parseFloat(numericPart) || 0;
        } catch (error) {
            return 0;
        }
    }

    extractSpecs($, element) {
        try {
            const specs = {};
            element.find(this.config.selectors.specs).each((_, spec) => {
                const text = $(spec).text().trim().toLowerCase();

                // Extract mileage
                if (text.includes('kms')) {
                    specs.mileage = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                }
                // Extract engine size
                else if (text.includes('cc')) {
                    specs.engineSize = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                }
                // Extract transmission type
                else if (['automatic', 'manual'].some(t => text.includes(t))) {
                    specs.transmission = text;
                }
                // Extract locality status
                else if (['local', 'foreign'].includes(text)) {
                    specs.locality = text;
                }
            });
            return specs;
        } catch (error) {
            return {};
        }
    }

    extractImages(element, $) { // Add $ as parameter
        try {
            const images = new Set(); // Use Set to avoid duplicates

            // Find all image containers
            element.find(this.config.selectors.imageContainer).each((_, container) => {
                // Use find directly on the container with cheerio
                const imgElement = $(container).find('img');

                // Try direct src
                const src = imgElement.attr('src');
                if (src && src.includes('media.autochek.africa')) {
                    images.add(src);
                }

                // Try srcset
                const srcset = imgElement.attr('srcset');
                if (srcset) {
                    // Parse srcset attribute to get all image URLs
                    const srcsetUrls = srcset.split(',')
                        .map(src => src.trim().split(' ')[0])
                        .filter(url => url.includes('media.autochek.africa'));

                    // Add highest quality image (usually the last one)
                    if (srcsetUrls.length > 0) {
                        images.add(srcsetUrls[srcsetUrls.length - 1]);
                    }
                }
            });

            // Also try finding any other images that might be outside the container
            element.find(this.config.selectors.images).each((_, img) => {
                const src = $(img).attr('src');
                if (src && src.includes('media.autochek.africa')) {
                    images.add(src);
                }
            });

            return Array.from(images);
        } catch (error) {
            console.error('Error extracting images:', error);
            return [];
        }
    }

    extractUrl(element) {
        try {
            const href = element.find(this.config.selectors.carLink).first().attr('href');
            // The href starts with /ke/car/, so we need to append it to the base URL
            return href ? `https://autochek.africa${href}` : '';
        } catch (error) {
            return '';
        }
    }

    extractExternalId(element) {
        try {
            const href = element.find(this.config.selectors.carLink).first().attr('href');
            // Extract ID from URL pattern
            const match = href.match(/ref-([^/]+)/);
            return match ? match[1] : '';
        } catch (error) {
            return '';
        }
    }

    isValidListing(listing) {
        return (
            listing.title &&
            listing.price > 0 &&
            listing.externalId &&
            listing.url
        );
    }

    async normalizeData(listing) {
        // Extract make and model from title
        const titleParts = listing.title.split(' ');
        const year = parseInt(titleParts[0]) || null;
        const make = titleParts[1] || '';
        const model = titleParts.slice(2).join(' ');

        return {
            title: listing.title,
            make,
            model,
            year,
            price: listing.price,
            specs: {
                ...listing.specs,
                bodyType: null, // Can be extracted from detailed page if needed
                fuelType: null, // Can be extracted from detailed page if needed
            },
            mileage: listing.specs.mileage || null,
            engineSize: listing.specs.engineSize || null,
            transmission: listing.specs.transmission || null,
            location: listing.location,
            images: listing.images,
            sourceUrl: listing.url,
            externalId: listing.externalId
        };
    }
}

export default new ChekiCrawler();