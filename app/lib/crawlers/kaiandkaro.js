import {BaseCrawler} from '@/app/lib/crawlers/base';
import { logger } from '@/app/lib/monitoring/logger';
import puppeteer from 'puppeteer';

class KaiAndKaroCrawler extends BaseCrawler {
    constructor() {
        super();
        this.name = 'kai-and-karo';
        this.baseUrl = 'https://www.kaiandkaro.com';
        this.sourceId = 'KaiAndKaro';
        this.selectors = {
            searchInput: 'input#search',
            searchButton: 'button.chakra-button.css-o0f1dz',
            carContainer: '.chakra-card.css-1ndte01',
            carWrapper: '.chakra-linkbox.css-1kh7oap',
            carLink: 'a.chakra-linkbox__overlay.css-1hnz6hu[href]',
            title: 'h2.chakra-heading.css-18j379d',
            price: 'p.chakra-text.css-0',
            location: '.css-b03jaa',
            specs: {
                Transmission: '.css-buyryd',
                EngineSize: '.css-buyryd',
                YOM: '.chakra-badge.css-1dub5x4'
            },
            image: '.css-1ytrg1k.card-img-top'
        };
    }

    buildSearchUrl(make, model) {
        const searchTerms = [make, model].filter(Boolean).join(' ');
        return searchTerms 
            ? `${this.baseUrl}/vehicles?search=${encodeURIComponent(searchTerms)}`
            : `${this.baseUrl}/vehicles`;
    }

    normalizeLocation(location) {
        return location?.trim() === 'Kenyan Used' ? 'Nairobi' : 'Foreign Used';
    }

    parseTitleForMakeModel(title) {
        if (!title) return { make: null, model: null };
        const words = title.trim().split(' ');
        return {
            make: words[0] || null,
            model: words.slice(1).join(' ') || null
        };
    }

    async crawl(searchParams = {}, testMode = false) {
        let browser = null;
        let page = null;
        try {
            const url = this.buildSearchUrl(searchParams.make, searchParams.model);
            await logger.info('[KaiAndKaro] Starting crawl', { url, testMode });
            
            browser = await puppeteer.launch({ headless: true });
            page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            const listings = await this.extractListings(page);
            await logger.info('[KaiAndKaro] Listings extracted', { count: listings.length });

            if (testMode) {
                return Promise.all(listings.map(l => this.normalizeData(l)));
            } else {
                for (const listing of listings) {
                    const normalized = await this.normalizeData(listing);

                    await logger.info('[KaiAndKaro] Normalized listing', { url: normalized.listings.create.url });

                    await this.save(normalized);
                }
                return listings;
            }
        } catch (error) {
            await logger.error('[KaiAndKaro] Crawler error', { error: error.message, stack: error.stack });
            throw error;
        } finally {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.close().catch(() => {});
        }
    }

    async extractListings(page) {
        try {
            await page.waitForSelector(this.selectors.carContainer);
            
            return await page.evaluate((sel, baseUrl) => {
                const cards = document.querySelectorAll(sel.carContainer);
                
                return Array.from(cards).map(card => {
                    const specElements = Array.from(card.querySelectorAll(sel.specs.Transmission));
                    const link = card.querySelector(sel.carLink)?.getAttribute('href');
                   
                    // Ensure we always have a valid URL
                    const fullUrl = link 
                        ? link.startsWith('https') 
                            ? link 
                            : `${baseUrl}${link}`
                        : `${baseUrl}/vehicles`;
                    
                    return {
                        title: card.querySelector(sel.title)?.textContent?.trim() || 'Unknown',
                        price: card.querySelector(sel.price)?.textContent?.trim() || '0',
                        location: card.querySelector(sel.location)?.textContent?.trim() || 'Unknown',
                        transmission: specElements[0]?.textContent?.trim() || null,
                        engineSize: specElements[1]?.textContent?.trim() || null,
                        year: card.querySelector(sel.specs.YOM)?.textContent?.trim() || null,
                        image: card.querySelector(sel.image)?.src || null,
                        url: fullUrl,
                        externalId: link?.split('/').pop() || `kk-${Date.now()}`
                    };
                });
            }, this.selectors, this.baseUrl);
        } catch (error) {
            await logger.error('[KaiAndKaro] Error extracting listings', { error });
            return [];
        }
    }

   
    async normalizeData(listing) {
        if (!listing.url || !listing.url.trim()) {
            listing.url = `${this.baseUrl}/vehicles`;
        }
        const { make, model } = this.parseTitleForMakeModel(listing.title);
        
        // First create the car data structure
        const carData = {
            make: make || 'Unknown',
            model: model || 'Unknown',
            year: this.parseYear(listing.year),
            transmission: listing.transmission || null,
            engineSize: listing.engineSize ? parseFloat(listing.engineSize) : null,
            price: this.parsePrice(listing.price),
            specs: {
                transmission: listing.transmission || null,
                engineSize: listing.engineSize || null,
                location: this.normalizeLocation(listing.location)
            },
            listings: {
                create: {
                    externalId: listing.externalId,
                    url: listing.url || `${this.baseUrl}/vehicles`,  // Ensure URL is always present
                    price: this.parsePrice(listing.price),
                    location: this.normalizeLocation(listing.location),
                    currency: 'KES',
                    images: listing.image ? { urls: [listing.image] } : null,
                    active: true,
                    source: {
                        connect: { name: this.sourceId }
                    }
                }
            }
        };
    
        // Convert specs to JSON string as per schema requirement
        carData.specs = JSON.stringify(carData.specs);
        
        // If images exist, convert to JSON string
        if (carData.listings.create.images) {
            carData.listings.create.images = JSON.stringify(carData.listings.create.images);
        }
    
        return carData;
    }
    parsePrice(price) {
        if (!price) return null;
        return parseInt(price.replace(/[^0-9]/g, ''), 10) || null;
    }

    parseYear(year) {
        if (!year) return null;
        return parseInt(year.replace(/[^0-9]/g, ''), 10) || null;
    }
    async save(carData) {

        await logger.info('Saving car data', { carData });
       
        return await prisma.car.create({
            data: {
                make: carData.make,
                model: carData.model,
                year: carData.year,
                transmission: carData.transmission,
                engineSize: carData.engineSize,
                price: carData.price,
                specs: carData.specs,
                sourceUrl: carData.url,
                externalId: carData.externalId,
                images: carData.images
            }
        });
    }
}

export default new KaiAndKaroCrawler();