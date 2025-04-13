import './Config/envLoader.js';
import { connectDB } from './DB/connectMongoDB.js';
import { generateTransporter } from './mailer.js';
import { http } from './socket.js';
import { connectRedis } from './DB/connectRedis.js';
import {
    startBillingCronJob,
    startCleanupCronJob,
} from './Controllers/bill.Controller.js';
// import { seedDatabase } from './seeder.js';

const PORT = process.env.PORT || 4000;

// MongoDB connection
await connectDB();

// Redis connection
const redisClient = await connectRedis();

// nodemailer transporter
const transporter = await generateTransporter();

// cron job to generate bills every month at 12:05 AM
startBillingCronJob();
// cron job to delete bills & orders every 6 months (july & jan) at 12:05 AM
startCleanupCronJob();

// await seedDatabase();

http.listen(PORT, () => console.log(`✅ server listening on port ${PORT}...`));

export { transporter, redisClient };
