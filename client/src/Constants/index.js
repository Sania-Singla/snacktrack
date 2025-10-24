import SANIAIMAGE from '../Assets/images/sania.jpg';
import LOGO from '../Assets/images/logo.png';
import LOGO_SVG from '../Assets/images/logo_svg.png';
import PU from '../Assets/images/pu.png';
import UIET from '../Assets/images/uiet.png';
import SNACK_PLACEHOLDER_IMAGE from '../Assets/images/snack.png';
import USER_PLACEHOLDER_IMAGE from '../Assets/images/user.png';
import AUDIO_FILE from '../Assets/audios/notification.wav';

export const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL + '/api/v1';
export const EMAIL = 'snacktrack@gmail.com';
export const CONTACTNUMBER = '+91 **********';
export const ADDRESS = 'UIET, Panjab University, Chandigarh, India';
export const MAX_FILE_SIZE = 5;
export const LIMIT = 8; // Pagination limit
export const ALLOWED_EXT = ['png', 'jpg', 'jpeg'];
export const SERVER_ERROR = 500;
export const CONTRIBUTORS = [
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
export const SOCKET_EVENTS = {
    NEW_ORDER: 'newOrder',
    ITEM_PREPARED: 'itemPrepared',
    ITEM_PICKEDUP: 'itemPickedUp',
    ORDER_REJECTED: 'orderRejected',
    ORDER_PREPARED: 'orderPrepared',
    ORDER_PICKEDUP: 'orderPickedUp',
    EXTRA_CHARGES_UPDATED: 'extraChargesUpdated',
};

export {
    LOGO,
    LOGO_SVG,
    UIET,
    PU,
    AUDIO_FILE,
    SNACK_PLACEHOLDER_IMAGE,
    USER_PLACEHOLDER_IMAGE,
};
