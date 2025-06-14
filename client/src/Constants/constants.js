import SANIAIMAGE from '../Assets/images/snack.png';
import LOGO from '../Assets/images/logo.png';
import LOGO_SVG from '../Assets/images/logo_svg.png';
import PU from '../Assets/images/pu.png';
import UIET from '../Assets/images/uiet.png';
import SNACK_PLACEHOLDER_IMAGE from '../Assets/images/snack.png';
import USER_PLACEHOLDER_IMAGE from '../Assets/images/user.png';
import AUDIO_FILE from '../Assets/audios/notification.wav';

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL + '/api';

const DISCORD_LINK = 'https://discord.com/channels/@user_name';
const EMAIL = 'snacktrack@gmail.com';
const CONTACTNUMBER = '+91 1234567890';
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
        bio: 'Full-stack developer passionate about creating beautiful, scalable applications',
        name: 'user name',
        socials: {
            linkedIn: 'https://www.linkedin.com/in/user_name',
            discord: 'https://discord.com/channels/@user_name',
            gitHub: 'https://github.com/user_name',
            threads: 'https://x.com/user_name',
            instagram: 'https://www.instagram.com/user_name',
        },
    },
];

export {
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
    CONTRIBUTORS,
    EMAIL,
    CONTACTNUMBER,
    ADDRESS,
    SERVER_ERROR,
    TAX,
    DISCORD_LINK,
};
