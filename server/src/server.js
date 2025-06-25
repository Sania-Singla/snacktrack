import 'dotenv/config';
import { connectMongoDB } from './Config/mongodb.js';
import { connectRedis } from './Config/redis.js';
import { generateTransporter } from './Config/nodemailer.js';
import { http } from './socket.js';
import {
    startBillingCronJob,
    startCleanupCronJob,
} from './Controllers/bill.Controller.js';

const PORT = process.env.PORT || 4000;

await connectMongoDB();
const redisClient = await connectRedis();
const transporter = await generateTransporter();

startBillingCronJob();
startCleanupCronJob();

http.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}...`));

export { transporter, redisClient };
