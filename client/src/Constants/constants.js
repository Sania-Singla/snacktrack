const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL + '/api';
const LIMIT = 10;
import SANIAIMAGE from '../Assets/images/sania.jpg';
import LOGO from '../Assets/images/logo.png';
import SNACK_PLACEHOLDER_IMAGE from '../Assets/images/snack.png';
import USER_PLACEHOLDER_IMAGE from '../Assets/images/user.png';
import AUDIO_FILE from '../Assets/audios/notification.wav';
const EMAIL = 'snacktrack@gmail.com';
const CONTACTNUMBER = 'xxxxxxxxxx';
const MAX_FILE_SIZE = 5;
const ALLOWED_EXT = ['png', 'jpg', 'jpeg'];
const SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const PER_ITEM_PACKAGING_CHARGES = 0.5;
const TAX = 0.05; // 5% tax on total amount

const CONTRIBUTORS = [
    {
        image: SANIAIMAGE,
        role: 'Full Stack Developer',
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
    {
        image: SANIAIMAGE,
        role: 'Full Stack Developer',
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
    {
        image: SANIAIMAGE,
        role: 'Full Stack Developer',
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
    SERVER_ERROR,
    BAD_REQUEST,
    TAX,
};
