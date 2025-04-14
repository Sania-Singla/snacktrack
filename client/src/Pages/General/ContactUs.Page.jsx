import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import { useState } from 'react';
import { icons } from '../../Assets/icons';
import { EMAIL, CONTACTNUMBER, ADDRESS } from '../../Constants/constants';
import toast from 'react-hot-toast';
import { userService } from '../../Services';

export default function ContactUsPage() {
    const [inputs, setInputs] = useState({ subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

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

    function copyEmail() {
        window.navigator.clipboard.writeText(EMAIL);
        toast.success('Email Copied to Clipboard 🤗');
    }

    return (
        <div className="w-full min-h-screen p-2 md:p-4">
            {/* Hero Section */}
            <section className="w-full bg-white shadow-md rounded-xl py-10 px-8 md:px-16">
                <h1 className="text-[35px] font-bold text-gray-900">
                    Contact Us
                </h1>
                <p className="mt-4 text-gray-700">
                    We're here to help! Whether you need support, have feedback,
                    or suggestions, feel free to reach out. Our team is ready to
                    assist you!
                </p>
            </section>

            {/* Grid Layout for Content */}
            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Section - Contact Info & Support */}
                <div className="flex flex-col gap-6">
                    {/* Technical Support */}
                    <div className="bg-white shadow-md p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            👥 Technical Support
                        </h2>
                        <p className="text-gray-700">
                            Need help with{' '}
                            <Link
                                to="/"
                                className="text-[#4977ec] font-semibold hover:underline"
                            >
                                Snack Track
                            </Link>{' '}
                            or facing technical issues? Visit our{' '}
                            <Link
                                to="/support"
                                className="text-[#4977ec] font-semibold hover:underline"
                            >
                                Support Page
                            </Link>{' '}
                            for troubleshooting tips and direct assistance.
                        </p>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white shadow-md p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            📚 Frequently Asked Questions
                        </h2>
                        <p className="text-gray-700">
                            Have a question? Check out our{' '}
                            <Link
                                to="/faqs"
                                className="text-[#4977ec] font-semibold hover:underline"
                            >
                                FAQ page
                            </Link>{' '}
                            for quick answers. You might find the solution
                            without having to reach out!
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white shadow-md p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Contact Information
                        </h2>
                        <div className="flex flex-col gap-3">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <div className="size-4 fill-black">
                                        {icons.email}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <p className="text-gray-700">{EMAIL}</p>
                                    <button
                                        onClick={copyEmail}
                                        className="p-1 hover:bg-gray-100 rounded-full group"
                                    >
                                        <div className="size-4 fill-[#4977ec] group-hover:fill-[#3b62c2]">
                                            {icons.clipboard}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <div className="size-4 fill-black">
                                        {icons.contact}
                                    </div>
                                </div>
                                <p className="text-gray-700">{CONTACTNUMBER}</p>
                            </div>

                            {/* Address */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <div className="size-4 fill-black">
                                        {icons.home}
                                    </div>
                                </div>
                                <p className="text-gray-700">{ADDRESS}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Feedback Form */}
                <div>
                    <div className="bg-white shadow-md p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            🌟 Feedback & Queries
                        </h2>
                        <p className="text-gray-700">
                            Have ideas on how we can improve? We'd love to hear
                            from you! Share your thoughts to help make{' '}
                            <Link
                                to="/"
                                className="text-[#4977ec] font-semibold hover:underline"
                            >
                                Snack Track
                            </Link>{' '}
                            even better.
                        </p>
                    </div>

                    {/* Feedback Form */}
                    <form
                        onSubmit={submitQuery}
                        className="mt-6 bg-white p-6 rounded-xl shadow-md"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            📩 Contact Form
                        </h2>

                        {/* Subject Input */}
                        <div className="mb-1">
                            <div className="bg-white z-[1] ml-2 px-2 w-fit relative top-3 font-medium">
                                <label htmlFor="subject">
                                    <span className="text-red-500">*</span>{' '}
                                    Subject
                                </label>
                            </div>
                            <input
                                type="subject"
                                id="subject"
                                name="subject"
                                value={inputs.subject}
                                onChange={handleChange}
                                placeholder="Enter query subject"
                                className="shadow-md py-[10px] rounded-md indent-3 w-full border-[0.01rem] border-gray-500 bg-transparent"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Your email will be sent along with the query.
                            </p>
                        </div>

                        {/* Message Input */}
                        <div className="mb-4">
                            <div className="bg-white z-[1] ml-2 px-2 w-fit relative top-3 font-medium">
                                <label htmlFor="message">
                                    <span className="text-red-500">*</span>{' '}
                                    Query / Feedback
                                </label>
                            </div>
                            <textarea
                                name="message"
                                id="message"
                                value={inputs.message}
                                onChange={handleChange}
                                placeholder="Let us know how we're doing!"
                                className="shadow-md py-[10px] rounded-md indent-3 w-full border-[0.01rem] border-gray-500 bg-transparent"
                                rows="4"
                                required
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
                            disabled={sending}
                            className="w-full bg-[#4977ec] hover:bg-[#3b62c2] text-white h-[40px] rounded-md"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
