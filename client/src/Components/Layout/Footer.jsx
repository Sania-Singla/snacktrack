import { Link } from 'react-router-dom';
import { LOGO_SVG, PU, UIET } from '../../Constants';

export default function Footer() {
    const links = [
        { name: 'Privacy Policy', link: '/privacy-policy' },
        { name: 'Contact', link: '/contact' },
        { name: 'About us', link: '/about' },
    ];

    const linkElements = links.map((link) => (
        <Link
            key={link.name}
            to={link.link}
            className="text-gray-500 hover:underline"
        >
            {link.name}
        </Link>
    ));

    return (
        <footer className="bg-gray-50 border-t border-gray-200 w-full pt-6 mt-4 sm:mt-0">
            <div className="sm:w-[90%] max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left: Branding and Socials */}
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-1">
                        <img
                            src={LOGO_SVG}
                            alt="Snack Track Logo"
                            className="size-9 object-cover"
                        />
                        <h2 className="text-base font-semibold text-gray-800">
                            Snack Track
                        </h2>
                    </div>
                    <p className="text-xs text-gray-600">
                        Your campus food companion.
                    </p>
                </div>

                {/* Right: University Info */}
                <div className="flex flex-col items-end gap-3 w-full">
                    <div className="flex gap-3">
                        <Link
                            to="https://puchd.ac.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={PU}
                                alt="PU Logo"
                                className="size-8 sm:size-9 rounded-full object-cover shadow-sm"
                            />
                        </Link>
                        <Link
                            to="https://uiet.puchd.ac.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={UIET}
                                alt="UIET Logo"
                                className="size-8 sm:size-9 rounded-full object-cover shadow-sm"
                            />
                        </Link>
                    </div>
                    <p className="text-xs text-gray-600 text-end md:text-right">
                        Panjab University, Chandigarh
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="sm:w-[90%] max-w-7xl mx-auto border-t border-gray-200 mt-6 pt-4 pb-1 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <p>
                    &copy; {new Date().getFullYear()} SnackTrack. Made with ❤️
                    for Panjab University.
                </p>
                <div className="flex gap-3 items-center">{linkElements}</div>
            </div>
        </footer>
    );
}
