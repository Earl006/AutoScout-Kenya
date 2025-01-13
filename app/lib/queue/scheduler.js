import { crawlerQueue } from './index';
import sources from '../../config/sources';

export const scheduleCrawlers = () => {
    // Schedule jobs for each source
    sources.forEach(source => {
        if (!source.active) return;

        crawlerQueue.add(
            {
                sourceId: source.id,
                url: source.baseUrl
            },
            {
                repeat: {
                    cron: source.crawlSchedule // e.g., '0 */6 * * *' for every 6 hours
                },
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 60000 // 1 minute
                }
            }
        );
    });
};