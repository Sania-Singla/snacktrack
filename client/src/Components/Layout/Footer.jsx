import { Link, useNavigate } from 'react-router-dom';
import { icons } from '../../Assets/icons';
import { Button } from '..';
import { useState } from 'react';
import { CONTRIBUTORS, LOGO } from '../../Constants/constants';
import toast from 'react-hot-toast';
import { userService } from '../../Services';

export default function Footer() {
    const [inputs, setInputs] = useState({ subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    // Social media icons
    const socialElements = Object.entries(CONTRIBUTORS[0].socials).map(
        ([platform, url]) => (
            <Link key={platform} to={url} target="_blank">
                <div className="bg-white p-[6px] rounded-full drop-shadow-sm hover:bg-[#d4d4d4] transition-colors duration-300 w-fit">
                    <div className="size-[18px]">{icons[platform]}</div>
                </div>
            </Link>
        )
    );

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    async function submitQuery(e) {
        e.preventDefault();
        setSending(true);
        try {
            const res = await userService.sendQuery(inputs);
            if (res && res.message === 'query sent successfully') {
                setInputs({ message: '', subject: '' });
                toast.success('Query Submitted Successfully 🤗');
            } else toast.error('Error in submitting query');
        } catch (err) {
            navigate('/server-error');
        } finally {
            setSending(false);
        }
    }

    // Footer links
    const links = [
        { path: '/', name: 'Home' },
        { path: '/support', name: 'Support' },
        { path: '/about-us', name: 'About Us' },
        { path: '/contact-us', name: 'Contact Us' },
    ];

    const linkElements = links.map((link) => (
        <p key={link.name} className="text-center">
            <Link
                to={link.path}
                className="hover:text-[#4977ec] text-[15px] hover:underline transition-colors duration-300"
            >
                {link.name}
            </Link>
        </p>
    ));

    return (
        <footer className="p-6 bg-[#f9f9f9]">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12">
                {/* Logo and Tagline */}
                <div className="flex flex-col gap-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-[50px] rounded-full overflow-hidden drop-shadow-sm">
                            <img
                                src={LOGO}
                                alt="Snack Track Logo"
                                className="object-cover size-full"
                            />
                        </div>
                        <div className="text-black font-semibold text-xl">
                            Snack Track
                        </div>
                    </Link>
                    <p className="text-gray-600 text-sm max-w-[250px]">
                        Generalized, Transparent & Secure.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-4">
                    <p className="text-center text-black font-semibold text-[18px] underline underline-offset-2">
                        Quick Links
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {linkElements}
                    </div>
                </div>

                {/* Feedback Form */}
                <form
                    onSubmit={submitQuery}
                    className="flex flex-col gap-4 max-w-[350px] w-full"
                >
                    <p className="text-black text-center font-semibold text-[18px] underline underline-offset-2">
                        Provide Feedback
                    </p>
                    <div className="flex flex-col items-center w-full gap-2">
                        <div>
                            <input
                                type="text"
                                placeholder="Your Feedback..."
                                value={inputs.message}
                                onChange={handleChange}
                                name="message"
                                required
                                className="flex-1 bg-white shadow-sm border border-gray-300 rounded-lg px-3 h-[32px] text-sm focus:border-[#4977ec] focus:outline-none"
                            />
                        </div>
                        <div>
                            <input
                                type="subject"
                                placeholder="Your Query Subject..."
                                value={inputs.subject}
                                onChange={handleChange}
                                name="subject"
                                required
                                className="flex-1 bg-white shadow-sm border border-gray-300 rounded-lg px-3 h-[32px] text-sm focus:border-[#4977ec] focus:outline-none"
                            />
                        </div>
                        <Button
                            btnText={
                                sending ? (
                                    <div className="w-full flex items-center justify-center">
                                        <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                            {icons.loading}
                                        </div>
                                    </div>
                                ) : (
                                    'Submit'
                                )
                            }
                            type="submit"
                            className="bg-[#4977ec] hover:bg-[#3b62c2] text-white w-[80px] h-[32px] rounded-md transition-colors duration-300"
                        />
                    </div>
                </form>
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-300" />

            {/* Copyright and Social Links */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-600 text-sm text-center">
                    &copy; 2024 Snack Track. All rights reserved.
                </p>
                <div className="flex items-center gap-4">{socialElements}</div>
            </div>
        </footer>
    );
}
