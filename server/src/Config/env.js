import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path:
        process.env.ENV === 'production'
            ? '/etc/snacktrack_server.env'
            : path.resolve(process.cwd(), '.env.local'),
});
