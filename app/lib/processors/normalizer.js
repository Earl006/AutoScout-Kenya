import { logger } from '../monitoring/logger';

export const normalize = async (rawData) => {
    try {
        // Handle single item or array
        const items = Array.isArray(rawData) ? rawData : [rawData];

        return items.map(item => {
            // Extract make and model from title
            const { make, model } = extractMakeModel(item.title);

            return {
                make: make || 'Unknown',
                model: model || 'Unknown',
                year: normalizeYear(item),
                price: normalizePrice(item),
                mileage: normalizeMileage(item),
                specs: normalizeSpecs(item),
                sourceUrl: item.sourceUrl,
                images: normalizeImages(item.images)
            };
        });
    } catch (error) {
        logger.error(`Normalization error: ${error.message}`);
        return [];
    }
};

// Helper functions for normalizer
function extractMakeModel(title) {
    // Common car makes for pattern matching
    const commonMakes = [
        'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Volkswagen', 'Mercedes',
        'BMW', 'Audi', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Mitsubishi'
    ];

    try {
        // Find the make in the title
        const make = commonMakes.find(make =>
            title.toLowerCase().includes(make.toLowerCase())
        );

        if (!make) return { make: null, model: null };

        // Extract model by removing make and cleaning
        const model = title
            .toLowerCase()
            .replace(make.toLowerCase(), '')
            .replace(/^\s+|-\s+|\s+$/g, '')
            .split(' ')[0];

        return { make, model };
    } catch (error) {
        logger.error(`Error extracting make/model: ${error.message}`);
        return { make: null, model: null };
    }
}

function normalizeYear(item) {
    try {
        const year = item.year || (item.specs && item.specs.year);
        if (!year) return null;

        const normalizedYear = parseInt(year);
        // Basic validation for reasonable year range
        if (normalizedYear >= 1900 && normalizedYear <= new Date().getFullYear() + 1) {
            return normalizedYear;
        }
        return null;
    } catch (error) {
        logger.error(`Error normalizing year: ${error.message}`);
        return null;
    }
}

function normalizePrice(item) {
    try {
        const price = parseFloat(item.price);
        return isNaN(price) ? 0 : price;
    } catch (error) {
        logger.error(`Error normalizing price: ${error.message}`);
        return 0;
    }
}

function normalizeMileage(item) {
    try {
        const mileage = parseInt(item.mileage);
        return isNaN(mileage) ? 0 : mileage;
    } catch (error) {
        logger.error(`Error normalizing mileage: ${error.message}`);
        return 0;
    }
}

function normalizeSpecs(item) {
    try {
        const specs = item.specs || {};
        return {
            transmission: (specs.transmission || '').toLowerCase(),
            fuelType: (specs.fuel || '').toLowerCase(),
            bodyType: (specs.bodyType || '').toLowerCase(),
            engineSize: specs.engine ? parseFloat(specs.engine) : null
        };
    } catch (error) {
        logger.error(`Error normalizing specs: ${error.message}`);
        return {};
    }
}

function normalizeImages(images) {
    try {
        if (!Array.isArray(images)) return [];
        return images
            .filter(url => url && typeof url === 'string')
            .map(url => url.trim())
            .filter(url => url.startsWith('http'));
    } catch (error) {
        logger.error(`Error normalizing images: ${error.message}`);
        return [];
    }
}