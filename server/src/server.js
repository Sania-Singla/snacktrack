// import 'dotenv/config';  // specified in package.json as dotenv will need to be install on prod as well otherwise
import { http } from './socket.js';
import { startBillingCronJob, startCleanupCronJob } from './CronJobs/bills.js';
import {
    connectMongoDB,
    connectRedis,
    generateTransporter,
    connectTwilio,
} from './Config/index.js';
import { Order } from './Models/order.Model.js';
import { PackagedFood } from './Models/packagedFood.Model.js';
import { Snack } from './Models/snack.Model.js';
import { Student } from './Models/student.Model.js';
import { Bill } from './Models/bill.Model.js';
import { Contractor } from './Models/contractor.Model.js';

const PORT = process.env.PORT || 4000;

let mongoConn, redisClient, transporter, twilioClient;

try {
    [mongoConn, redisClient, transporter, twilioClient] = await Promise.all([
        connectMongoDB(),
        connectRedis(),
        generateTransporter(),
        connectTwilio(),
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
