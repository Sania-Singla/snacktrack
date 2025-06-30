import SANIAIMAGE from '../Assets/images/snack.png';
import LOGO from '../Assets/images/logo.png';
import LOGO_SVG from '../Assets/images/logo_svg.png';
import PU from '../Assets/images/pu.png';
import UIET from '../Assets/images/uiet.png';
import SNACK_PLACEHOLDER_IMAGE from '../Assets/images/snack.png';
import USER_PLACEHOLDER_IMAGE from '../Assets/images/user.png';
import AUDIO_FILE from '../Assets/audios/notification.wav';

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL + '/api/v1';
const EMAIL = 'snacktrack@gmail.com';
const CONTACTNUMBER = '+91 **********';
const ADDRESS = 'UIET, Panjab University, Chandigarh, India';
const MAX_FILE_SIZE = 5;
const LIMIT = 20; // Pagination limit
const ALLOWED_EXT = ['png', 'jpg', 'jpeg'];
const SERVER_ERROR = 500;
const PER_ITEM_PACKAGING_CHARGES = 0; // ex: 0.5 rupees
const TAX = 0; // ex: 0.05 for 5% tax on total amount

const CONTRIBUTORS = [
    {
        image: SANIAIMAGE,
        role: 'Lead Developer',
        bio: 'Visionary Full Stack Developer crafting impactful, real-world solutions with precision and purpose.',
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
    CONTRIBUTORS,
    BASE_BACKEND_URL,
    LIMIT,
    LOGO,
    LOGO_SVG,
    UIET,
    PU,
    AUDIO_FILE,
    SNACK_PLACEHOLDER_IMAGE,
    USER_PLACEHOLDER_IMAGE,
    MAX_FILE_SIZE,
    PER_ITEM_PACKAGING_CHARGES,
    ALLOWED_EXT,
    EMAIL,
    CONTACTNUMBER,
    ADDRESS,
    SERVER_ERROR,
    TAX,
};
