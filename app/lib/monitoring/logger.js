import prisma from "../prisma";

export const logger = {
    async info(message, metadata = {}) {
        try {
            // Convert metadata to a serializable format
            const serializedMetadata = JSON.parse(JSON.stringify(metadata));

            await prisma.crawlerLog.create({
                data: {
                    sourceId: metadata.sourceId ?? "Unknown",
                    status: 'INFO',
                    message,
                    metadata: serializedMetadata
                }
            });
            console.log(`[INFO] ${message}`, serializedMetadata);
        } catch (error) {
            console.error('Error logging info:', error);
        }
    },

    async error(message, metadata = {}) {
        try {
            // Convert metadata to a serializable format
            const serializedMetadata = JSON.parse(JSON.stringify(metadata));

            await prisma.crawlerLog.create({
                data: {
                    sourceId: metadata.sourceId ?? "Unknown",
                    status: 'ERROR',
                    message,
                    metadata: serializedMetadata
                }
            });
            console.error(`[ERROR] ${message}`, serializedMetadata);
        } catch (error) {
            console.error('Error logging error:', error);
        }
    },

    async warn(message, metadata = {}) {
        try {
            // Convert metadata to a serializable format
            const serializedMetadata = JSON.parse(JSON.stringify(metadata));

            await prisma.crawlerLog.create({
                data: {
                    sourceId: metadata.sourceId ?? "Unknown",
                    status: 'WARN',
                    message,
                    metadata: serializedMetadata
                }
            });
            console.warn(`[WARN] ${message}`, serializedMetadata);
        } catch (error) {
            console.error('Error logging warn:', error);
        }
    }
};