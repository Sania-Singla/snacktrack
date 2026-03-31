// import 'dotenv/config';  // specified in package.json as dotenv will need to be install on prod as well otherwise
import { http } from './socket.js';
import { startBillingCronJob, startCleanupCronJob } from './CronJobs/bills.js';
import {
    connectMongoDB,
    connectRedis,
    // generateTransporter, // for render
    // connectTwilio,
} from './Config/index.js';

const PORT = process.env.PORT || 4000;

let mongoConn, redisClient, transporter, twilioClient;

try {
    [mongoConn, redisClient, transporter, twilioClient] = await Promise.all([
        connectMongoDB(),
        connectRedis(),
        // generateTransporter(),
        // connectTwilio(),
    ]);

    startBillingCronJob();
    // startCleanupCronJob();  // might cause problems verify the concept before enabling

    http.listen(PORT, () =>
        console.log(`💻 Server listening on port ${PORT}...`)
    );
} catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
}

export { mongoConn, transporter, redisClient, twilioClient };
