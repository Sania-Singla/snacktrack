const LIMIT = 20;
import SANIAIMAGE from '../Assets/images/sania.jpg';
import LOGO from '../Assets/images/logo.png';
import SNACK_PLACEHOLDER_IMAGE from '../Assets/images/snack.png';
import USER_PLACEHOLDER_IMAGE from '../Assets/images/user.png';
const EMAIL = 'snacktrack@gmail.com';
const CONTACTNUMBER = 'xxxxxxxxxx';
const MAX_FILE_SIZE = 5;
const ALLOWED_EXT = ['png', 'jpg', 'jpeg'];
const SERVER_ERROR = 500;
const BAD_REQUEST = 400;

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
    LIMIT,
    LOGO,
    SNACK_PLACEHOLDER_IMAGE,
    USER_PLACEHOLDER_IMAGE,
    MAX_FILE_SIZE,
    ALLOWED_EXT,
    CONTRIBUTORS,
    EMAIL,
    CONTACTNUMBER,
    SERVER_ERROR,
    BAD_REQUEST,
};
