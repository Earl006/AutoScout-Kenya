import { NextResponse } from 'next/server';
import chekiCrawler from "@/app/lib/crawlers/cheki";
import { logger } from "@/app/lib/monitoring/logger";

export async function GET(request) {
    let page = null;
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url') || 'https://autochek.africa/ke/cars-for-sale';
        const testMode = searchParams.get('testMode') === 'true';

        await logger.info('Starting test crawler for Cheki', { url, testMode, sourceId: 'Cheki' });

        if (!testMode) {
            await chekiCrawler.crawl(url);
            return NextResponse.json({
                success: true,
                message: 'Crawler completed successfully. Data saved to database.'
            });
        } else {
            const browser = await chekiCrawler.getBrowser();
            page = await browser.newPage();

            await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 60000
            });

            const listings = await chekiCrawler.extractListings(page);

            if (!listings || listings.length === 0) {
                await logger.info('No listings found', { url, sourceId: 'Cheki' });
            }

            const normalizedListings = await Promise.all(
                listings.map(listing => chekiCrawler.normalizeData(listing))
            );

            return NextResponse.json({
                success: true,
                data: {
                    raw: listings,
                    normalized: normalizedListings,
                    count: listings.length
                }
            });
        }
    } catch (error) {
        await logger.error('Error in test crawler endpoint', {
            error: error.message,
            stack: error.stack,
            sourceId: 'Cheki'
        });

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    } finally {
        if (page) {
            await page.close().catch(console.error);
        }
    }
}

export async function POST(request) {
    let page = null;

    try {
        const body = await request.json();
        const {
            make,
            model,
            minPrice,
            maxPrice,
            minYear,
            maxYear,
            location,
            pageNumber = 1,
            maxPages = 1
        } = body;

        if (make && typeof make !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'Make must be a string'
            }, { status: 400 });
        }

        await logger.info('Starting crawler search', {
            parameters: {
                make, model, minPrice, maxPrice, minYear, maxYear, location, pageNumber, maxPages
            }
        });

        const browser = await chekiCrawler.getBrowser();
        page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const baseUrl = buildFilterUrl({
            make, model, minPrice, maxPrice, minYear, maxYear, location
        });

        let allListings = [];
        let currentPage = pageNumber;
        let hasNextPage = true;

        while (hasNextPage && currentPage <= maxPages) {
            const pageUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page_number=${currentPage}`;
            await logger.info(`Crawling page ${currentPage}`, { url: pageUrl });

            try {
                await page.goto(pageUrl, {
                    waitUntil: 'networkidle0',
                    timeout: 60000
                });

                await Promise.race([
                    page.waitForSelector('.MuiGrid-item', { timeout: 10000 }),
                    page.waitForSelector('.no-results', { timeout: 10000 })
                ]);

                const pageListings = await chekiCrawler.extractListings(page);

                if (pageListings && pageListings.length > 0) {
                    allListings = [...allListings, ...pageListings];
                    hasNextPage = await checkForNextPage(page);
                    currentPage++;
                } else {
                    hasNextPage = false;
                }

            } catch (error) {
                await logger.error(`Error crawling page ${currentPage}`, {
                    error: error.message,
                    url: pageUrl
                });
                break;
            }
        }

        const normalizedListings = await Promise.all(
            allListings.map(listing => chekiCrawler.normalizeData(listing))
        );

        return NextResponse.json({
            success: true,
            data: {
                raw: allListings,
                normalized: normalizedListings,
                count: allListings.length,
                pagesScanned: currentPage - 1,
                hasMorePages: hasNextPage,
                filters: {
                    make, model, minPrice, maxPrice,
                    minYear, maxYear, location
                }
            }
        });

    } catch (error) {
        await logger.error('Error in crawler search endpoint', {
            error: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    } finally {
        if (page) {
            await page.close().catch(console.error);
        }
    }
}

function buildFilterUrl({
                            make,
                            model,
                            minPrice: price_low,
                            maxPrice: price_high,
                            minYear: year_low,
                            maxYear: year_high,
                            location
                        }) {
    let url = 'https://autochek.africa/ke/cars-for-sale';

    // Add make and model to URL
    if (make) {
        url += `/${encodeURIComponent(make)}`;
        if (model) {
            url += `/${encodeURIComponent(model)}`;
        }
    }

    // Add query parameters
    const queryParams = new URLSearchParams();

    if (year_low) queryParams.append('year_low', year_low);
    if (year_high) queryParams.append('year_high', year_high);
    if (price_low) queryParams.append('price_low', price_low);
    if (price_high) queryParams.append('price_high', price_high);
    if (location) queryParams.append('location', encodeURIComponent(location));

    // Add query parameters to URL if any exist
    const queryString = queryParams.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
}

async function checkForNextPage(page) {
    try {
        // Check if next page button exists and is not disabled
        const nextButton = await page.$('button[aria-label="Next page"]');
        if (!nextButton) return false;

        const isDisabled = await page.evaluate(
            button => button.hasAttribute('disabled'),
            nextButton
        );

        return !isDisabled;
    } catch (error) {
        return false;
    }
}