import cheerio from 'cheerio';
import { logger } from '../monitoring/logger';

export const parser = {
    // Extract text and clean it
    extractText(element, selector) {
        try {
            return element.find(selector).text().trim();
        } catch (error) {
            logger.error(`Error extracting text: ${error.message}`);
            return '';
        }
    },

    // Extract price and convert to number
    extractPrice(element, selector) {
        try {
            const priceText = element.find(selector).text().trim();
            // Remove currency symbols and commas, convert to number
            return parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        } catch (error) {
            logger.error(`Error extracting price: ${error.message}`);
            return 0;
        }
    },

    // Extract number from text (e.g., for mileage)
    extractNumber(text) {
        try {
            return parseInt(text.replace(/[^0-9]/g, '')) || 0;
        } catch (error) {
            logger.error(`Error extracting number: ${error.message}`);
            return 0;
        }
    },

    // Extract year from text
    extractYear(text) {
        try {
            const yearMatch = text.match(/\b(19|20)\d{2}\b/);
            return yearMatch ? parseInt(yearMatch[0]) : null;
        } catch (error) {
            logger.error(`Error extracting year: ${error.message}`);
            return null;
        }
    },

    // Extract image URLs
    extractImages(element, selector) {
        try {
            const images = [];
            element.find(selector).each((_, img) => {
                const src = img.attribs.src || img.attribs['data-src'];
                if (src) images.push(src);
            });
            return images;
        } catch (error) {
            logger.error(`Error extracting images: ${error.message}`);
            return [];
        }
    },

    // Parse specifications text into structured data
    parseSpecs(specsText) {
        const specs = {};

        // Common patterns for car specifications
        const patterns = {
            transmission: /(\b(manual|automatic|cvt|amt)\b)/i,
            fuel: /(\b(petrol|diesel|hybrid|electric)\b)/i,
            engine: /(\d+(\.\d+)?)\s*(cc|l|litre)/i,
            mileage: /(\d+[,\d]*)\s*(km|miles)/i,
            bodyType: /\b(sedan|suv|hatchback|wagon|pickup|van)\b/i
        };

        try {
            Object.entries(patterns).forEach(([key, pattern]) => {
                const match = specsText.match(pattern);
                if (match) specs[key] = match[1].toLowerCase();
            });
        } catch (error) {
            logger.error(`Error parsing specs: ${error.message}`);
        }

        return specs;
    }
};