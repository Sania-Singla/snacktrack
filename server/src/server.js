import 'dotenv/config';
import {
    connectMongoDB,
    connectRedis,
    generateTransporter,
    connectTwilio,
} from './Config/index.js';
import { http } from './socket.js';
import {
    startBillingCronJob,
    startCleanupCronJob,
} from './Controllers/bill.Controller.js';

const PORT = process.env.PORT || 4000;

const [mongoConn, redisClient, transporter, twilioClient] = await Promise.all([
    connectMongoDB(),
    connectRedis(),
    generateTransporter(),
    // connectTwilio(),
]);

startBillingCronJob();
startCleanupCronJob();

http.listen(PORT, () => console.log(`💻 Server listening on port ${PORT}...`));

export { mongoConn, transporter, redisClient, twilioClient };
