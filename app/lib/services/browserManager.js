// app/lib/services/browserManager.js
import puppeteer from 'puppeteer';
import { logger } from '../monitoring/logger';

class BrowserManager {
    constructor() {
        this.browser = null;
        this.isInitializing = false;
        this.initPromise = null;
    }

    async getBrowser() {
        if (this.browser) {
            try {
                // Test if browser is still responsive
                const pages = await this.browser.pages();
                return this.browser;
            } catch (error) {
                await logger.warn('Browser instance disconnected, reinitializing');
                this.browser = null;
            }
        }

        if (this.isInitializing) {
            return this.initPromise;
        }

        this.isInitializing = true;
        this.initPromise = this.initializeBrowser();

        try {
            this.browser = await this.initPromise;
            return this.browser;
        } finally {
            this.isInitializing = false;
            this.initPromise = null;
        }
    }

    async initializeBrowser() {
        try {
            const browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });

            // Handle browser disconnection
            browser.on('disconnected', async () => {
                await logger.warn('Browser disconnected');
                this.browser = null;
            });

            return browser;
        } catch (error) {
            await logger.error('Failed to initialize browser:', error);
            throw error;
        }
    }

    async closeBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (error) {
                await logger.error('Error closing browser:', error);
            } finally {
                this.browser = null;
            }
        }
    }
}

// Export a singleton instance
export const browserManager = new BrowserManager();