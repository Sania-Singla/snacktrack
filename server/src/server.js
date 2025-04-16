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

await connectDB(); // MongoDB connection
const redisClient = await connectRedis(); // Redis connection
const transporter = await generateTransporter(); // nodemailer transporter

startBillingCronJob(); // cron job to generate bills every month at 12:05 AM
startCleanupCronJob(); // cron job to delete bills & orders every 6 months (july & jan) at 12:05 AM

// await seedDatabase();

http.listen(PORT, () => console.log(`✅ server listening on port ${PORT}...`));

export { transporter, redisClient };
