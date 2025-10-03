import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path:
        process.env.ENV === 'production'
            ? '/etc/.env'
            : path.resolve(process.cwd(), '.env.local'),
});
