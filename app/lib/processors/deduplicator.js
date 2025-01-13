import prisma from "@/app/lib/prisma";
import { logger } from '../monitoring/logger';

export const deduplicate = async (normalizedData) => {
    try {
        const uniqueListings = [];
        const seen = new Set();

        for (const listing of normalizedData) {
            // Create a unique key based on multiple attributes
            const key = generateListingKey(listing);

            // Skip if we've seen this combination before
            if (seen.has(key)) continue;

            // Check if similar listing exists in database
            const exists = await checkDuplicateInDB(listing);
            if (!exists) {
                uniqueListings.push(listing);
                seen.add(key);
            }
        }

        return uniqueListings;
    } catch (error) {
        logger.error(`Deduplication error: ${error.message}`);
        return [];
    }
};

function generateListingKey(listing) {
    // Create a unique key combining multiple attributes
    return `${listing.make}-${listing.model}-${listing.year}-${listing.mileage}-${listing.price}`.toLowerCase();
}

async function checkDuplicateInDB(listing) {
    try {
        // Find similar listings within a small price and mileage range
        const similar = await prisma.car.findFirst({
            where: {
                AND: [
                    { make: listing.make },
                    { model: listing.model },
                    { year: listing.year },
                    {
                        OR: [
                            {
                                AND: [
                                    { mileage: { gte: listing.mileage * 0.95 } },
                                    { mileage: { lte: listing.mileage * 1.05 } }
                                ]
                            },
                            {
                                AND: [
                                    { price: { gte: listing.price * 0.95 } },
                                    { price: { lte: listing.price * 1.05 } }
                                ]
                            }
                        ]
                    }
                ]
            },
            include: {
                listings: {
                    where: {
                        active: true
                    }
                }
            }
        });

        return Boolean(similar);
    } catch (error) {
        logger.error(`Error checking duplicates in DB: ${error.message}`);
        return false;
    }
}