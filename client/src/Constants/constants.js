import SANIAIMAGE from '../Assets/images/sania.jpg';
import LOGO from '../Assets/images/logo.png';
import SNACK_PLACEHOLDER_IMAGE from '../Assets/images/snack.png';
import USER_PLACEHOLDER_IMAGE from '../Assets/images/user.png';
import AUDIO_FILE from '../Assets/audios/notification.wav';

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL + '/api';

const DISCORD_LINK = 'https://discord.com/channels/@sania_singla';
const EMAIL = 'snacktrack@gmail.com';
const CONTACTNUMBER = '+91 1234567890';
const ADDRESS = 'UIET, Panjab University, Chandigarh, India';
const MAX_FILE_SIZE = 5;
const LIMIT = 10; // Pagination limit
const ALLOWED_EXT = ['png', 'jpg', 'jpeg'];
const SERVER_ERROR = 500;
const PER_ITEM_PACKAGING_CHARGES = 0.5;
const TAX = 0.05; // 5% tax on total amount

const CONTRIBUTORS = [
    {
        image: SANIAIMAGE,
        role: 'Lead Developer',
        bio: 'Full-stack developer passionate about creating beautiful, scalable applications',
        name: 'Sania Singla',
        socials: {
            linkedIn: 'https://www.linkedin.com/in/sania-singla',
            discord: 'https://discord.com/channels/@sania_singla',
            gitHub: 'https://github.com/Sania-Singla',
            threads: 'https://x.com/sania_singla',
            instagram: 'https://www.instagram.com/sania__singla',
        },
    },
];

export {
    BASE_BACKEND_URL,
    LIMIT,
    LOGO,
    AUDIO_FILE,
    SNACK_PLACEHOLDER_IMAGE,
    USER_PLACEHOLDER_IMAGE,
    MAX_FILE_SIZE,
    PER_ITEM_PACKAGING_CHARGES,
    ALLOWED_EXT,
    CONTRIBUTORS,
    EMAIL,
    CONTACTNUMBER,
    ADDRESS,
    SERVER_ERROR,
    TAX,
    DISCORD_LINK,
};
