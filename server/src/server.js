import 'dotenv/config';
import { http } from './socket.js';
import { startBillingCronJob, startCleanupCronJob } from './CronJobs/bills.js';
import {
    connectMongoDB,
    connectRedis,
    generateTransporter,
    connectTwilio,
} from './Config/index.js';

const PORT = process.env.PORT || 4000;

let mongoConn, redisClient, transporter, twilioClient;

try {
    [mongoConn, redisClient, transporter, twilioClient] = await Promise.all([
        connectMongoDB(),
        connectRedis(),
        generateTransporter(),
        // connectTwilio(),
    ]);

    startBillingCronJob();
    startCleanupCronJob();

    http.listen(PORT, () =>
        console.log(`💻 Server listening on port ${PORT}...`)
    );
} catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
}

export { mongoConn, transporter, redisClient, twilioClient };
