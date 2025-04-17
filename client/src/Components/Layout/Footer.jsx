import { Link, useNavigate } from 'react-router-dom';
import { icons } from '../../Assets/icons';
import { Button } from '..';
import { useState } from 'react';
import { CONTRIBUTORS, LOGO } from '../../Constants/constants';
import toast from 'react-hot-toast';
import { userService } from '../../Services';
import { useUserContext } from '../../Contexts';
import { checkTokenExpired } from '../../Utils';

export default function Footer() {
    const [inputs, setInputs] = useState({ subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    // Enhanced social icons with hover effects
    const socialElements = Object.entries(CONTRIBUTORS[0].socials).map(
        ([platform, url]) => (
            <Link
                key={platform}
                to={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${platform} page`}
                className="bg-white p-[5px] rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:bg-[#4977ec] hover:text-white group"
            >
                <div className="size-4 text-gray-600 group-hover:text-white">
                    {icons[platform]}
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
            if (res?.message === 'query sent successfully') {
                setInputs({ message: '', subject: '' });
                toast.success('Thank you for your feedback!');
            } else if (res && res.message !== 'tokens missing') {
                toast.error('Failed to submit. Please try again.');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setSending(false);
        }
    }

    // Organized footer links
    const footerLinks = [
        {
            title: 'Navigation',
            links: [
                { path: '/', name: 'Home' },
                { path: `/bills/${user._id}`, name: 'Bills' },
                { path: `/orders/${user._id}`, name: 'My Orders' },
            ],
        },
        {
            title: 'Company',
            links: [
                { path: '/about-us', name: 'About Us' },
                { path: '/contact-us', name: 'Contact Us' },
                { path: '/support', name: 'Support' },
                { path: '/faqs', name: 'FAQs' },
            ],
        },
    ];

    const footerLinkElements = footerLinks.map((section) => (
        <div key={section.title} className="space-y-2">
            <h3 className="text-gray-800 font-semibold underline underline-offset-2 text-sm uppercase tracking-wider">
                {section.title}
            </h3>
            <ul className="space-y-[5px]">
                {section.links.map((link) => (
                    <li key={link.name}>
                        <Link
                            to={link.path}
                            className="text-gray-600 hover:text-[#4977ec] text-sm hover:underline hover:underline-offset-4"
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    ));

    return (
        <footer className="bg-[#f5f5f5] border-t border-gray-200 w-full">
            <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8 justify-between">
                {/* Brand Column */}
                <div className="space-y-4 w-full lg:w-[40%]">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition duration-300">
                            <img
                                src={LOGO}
                                alt="Snack Track Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-[#4977ec] transition duration-300">
                            Snack Track
                        </h2>
                    </Link>
                    <p className="text-gray-600 text-sm max-w-xs">
                        Your campus food companion. Fast, reliable, and
                        delicious.
                    </p>
                </div>

                <div className="flex flex-row justify-between gap-8 w-full pt-[10px]">
                    {/* Footer Links Columns */}
                    <div className="grid grid-cols-1 h-fit sm:grid-cols-2 gap-8 w-full">
                        {footerLinkElements}
                    </div>

                    {/* Contact Form Column */}
                    <div className="space-y-3 w-full">
                        <h3 className="text-gray-800 underline underline-offset-2 font-semibold text-sm uppercase tracking-wider">
                            Get In Touch
                        </h3>
                        <form
                            onSubmit={submitQuery}
                            className="space-y-3 w-full"
                        >
                            <div>
                                <input
                                    type="text"
                                    name="subject"
                                    value={inputs.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Subject"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4977ec] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <textarea
                                    name="message"
                                    value={inputs.message}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Your message..."
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4977ec] focus:border-transparent"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-[#4977ec] hover:bg-[#3a5fc8] text-white py-2 px-4 rounded-lg text-sm font-medium"
                                btnText={
                                    sending ? (
                                        <div className="flex items-center justify-center">
                                            <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                                {icons.loading}
                                            </div>
                                        </div>
                                    ) : (
                                        'Send Message'
                                    )
                                }
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="px-4 mx-2 border-t py-3 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-gray-500 text-xs sm:text-sm">
                    &copy; {new Date().getFullYear()} Snack Track. All rights
                    reserved.
                </p>
                <div className="flex gap-3">{socialElements}</div>
            </div>
        </footer>
    );
}
