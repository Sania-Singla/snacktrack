import { Link } from 'react-router-dom';
import { icons } from '../../Assets/icons';
import { CONTRIBUTORS, LOGO, LOGO_SVG, PU, UIET } from '../../Constants/constants';

export default function Footer() {
    const socialElements = Object.entries(CONTRIBUTORS[0].socials).map(
        ([platform, url]) => (
            <Link
                key={platform}
                to={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${platform} page`}
            >
                <div className="size-4 fill-gray-700 hover:fill-[#4977ec] transition-colors">
                    {icons[platform]}
                </div>
            </Link>
        )
    );

    return (
        <footer className="bg-gray-50 border-t border-gray-200 w-full pt-6 mt-4 sm:mt-0">
            <div className="w-[90%] max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Branding and Socials */}
                <div className="flex flex-col items-center sm:items-start gap-3">
                    <div className="flex items-center gap-2">
                        <img
                            src={LOGO_SVG}
                            alt="Snack Track Logo"
                            className="size-10 object-cover"
                        />
                        <h2 className="text-base font-semibold text-gray-800">
                            Snack Track
                        </h2>
                    </div>
                    <p className="text-xs text-gray-600 text-center md:text-left">
                        Your campus food companion.
                    </p>
                    {/* <div className="flex gap-3 pt-1">{socialElements}</div> */}
                </div>

                {/* Right: University Info */}
                <div className="flex flex-col items-center sm:items-end gap-3">
                    <div className="flex gap-3">
                        <img
                            src={PU}
                            alt="PU Logo"
                            className="size-9 rounded-full object-cover shadow-sm"
                        />
                        <img
                            src={UIET}
                            alt="UIET Logo"
                            className="size-9 rounded-full object-cover shadow-sm"
                        />
                    </div>
                    <p className="text-xs text-gray-600 text-center md:text-right">
                        Panjab University, Chandigarh
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 mt-6 pt-4 text-center text-xs text-gray-500">
                <p>
                    &copy; {new Date().getFullYear()} SnackTrack. Made with ❤️
                    for Panjab University.
                </p>
            </div>
        </footer>
    );
}
