// import 'dotenv/config';  // specified in package.json 
import { http } from './socket.js';
import { startBillingCronJob, startCleanupCronJob } from './CronJobs/bills.js';
import {
    connectMongoDB,
    connectRedis,
    // generateTransporter, // because of render
    // connectTwilio, // no credits left
} from './Config/index.js';

const PORT = process.env.PORT;

let mongoConn, redisClient, transporter, twilioClient;

[mongoConn, redisClient, transporter, twilioClient] = await Promise.all([
    connectMongoDB(),
    connectRedis(),
    // generateTransporter(),
    // connectTwilio(),
]);

startBillingCronJob();
// startCleanupCronJob();  // pending concept verification

http.listen(PORT, () => console.log(`💻 Server listening on port ${PORT}`));

export { mongoConn, transporter, redisClient, twilioClient };
