import { NextResponse } from 'next/server';
import { logger } from "@/app/lib/monitoring/logger";
import kaiAndKaroCrawler from "@/app/lib/crawlers/kaiandkaro";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const make = searchParams.get('make');
        const model = searchParams.get('model');
        const testMode = searchParams.get('testMode') === 'true';

        await logger.info('Starting KaiAndKaro GET crawl', { 
            params: { make, model }, 
            testMode, 
            sourceId: 'KaiAndKaro' 
        });

        const results = await kaiAndKaroCrawler.crawl({ make, model }, testMode);
        
        return NextResponse.json({
            success: true,
            message: testMode ? 'Test crawl completed' : 'Crawl completed and saved to database',
            data: results,
            count: results.length
        });
    } catch (error) {
        await logger.error('Error in KaiAndKaro GET crawler', {
            error: error.message,
            stack: error.stack,
            sourceId: 'KaiAndKaro'
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { make, model } = body;

        await logger.info('Starting KaiAndKaro POST crawl', {
            params: { make, model }
        });

        const results = await kaiAndKaroCrawler.crawl({ make, model }, false);
        const normalizedResults = await Promise.all(
            results.map(listing => kaiAndKaroCrawler.normalizeData(listing))
        );

        return NextResponse.json({
            success: true,
            data: {
                raw: results,
                normalized: normalizedResults,
                count: results.length,
                filters: { make, model }
            }
        });
    } catch (error) {
        await logger.error('Error in KaiAndKaro POST crawler', {
            error: error.message,
            stack: error.stack
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}