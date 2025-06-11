import './Config/envLoader.js';
import { connectMongoDB } from './DB/connectMongoDB.js';
import { generateTransporter } from './mailer.js';
import { http } from './socket.js';
import { connectRedis } from './DB/connectRedis.js';
import {
    startBillingCronJob,
    startCleanupCronJob,
} from './Controllers/bill.Controller.js';

const PORT = process.env.PORT || 4000;

await connectMongoDB();
const redisClient = await connectRedis();
const transporter = await generateTransporter(); // nodemailer

startBillingCronJob(); // cron job to generate bills every month at 12:05 AM
startCleanupCronJob(); // cron job to delete bills & orders every 6 months (july & jan) at 12:05 AM

http.listen(PORT, () => console.log(`✅ server listening on port ${PORT}...`));
export { transporter, redisClient };
