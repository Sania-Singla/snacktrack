import './Config/envLoader.js';
import { connectDB } from './DB/connectMongoDB.js';
import { generateTransporter } from './mailer.js';
import { http } from './socket.js';
import { connectRedis } from './DB/connectRedis.js';
// import { seedDatabase } from './seeder.js';

const PORT = process.env.PORT || 4000;

// MongoDB connection
await connectDB();

// Redis connection
const redisClient = await connectRedis();

// nodemailer transporter
const transporter = await generateTransporter();

// await seedDatabase();

// start the server
http.listen(PORT, () => console.log(`✅ server listening on port ${PORT}...`));

export { transporter, redisClient };
