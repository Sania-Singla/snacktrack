import { Link } from 'react-router-dom';
import { Button } from '../Components';
import { useState } from 'react';
import { icons } from '../Assets/icons';
import { EMAIL, CONTACTNUMBER } from '../Constants/constants';
import toast from 'react-hot-toast';

export default function ContactUsPage() {
    const [inputs, setInputs] = useState({ email: '', feedback: '' });

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    function submitFeedback(e) {
        e.preventDefault();
        setInputs({ feedback: '', email: '' });
        toast.success('Feedback Submitted Successfully 🤗');
    }

    function copyEmail() {
        window.navigator.clipboard.writeText(EMAIL);
        toast.success('Email Copied to Clipboard 🤗');
    }

    return (
        <div className="w-full min-h-screen">
            {/* Hero Section */}
            <section className="w-full bg-white shadow-md rounded-xl py-10 px-8 md:px-16">
                <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
                <p className="mt-4 text-lg text-gray-700 max-w-3xl">
                    We're here to help! Whether you need support, have feedback,
                    or suggestions, feel free to reach out. Our team is ready to
                    assist you!
                </p>
            </section>

            {/* Grid Layout for Content */}
            <div className="w-full px-8 md:px-16 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Section - Contact Info & Support */}
                <div className="flex flex-col gap-8">
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
                            for quick answers.
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white shadow-md p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Contact Information
                        </h2>
                        <div className="flex flex-col gap-4">
                            {/* Email */}
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <div className="size-5 fill-black">
                                        {icons.email}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-700">{EMAIL}</p>
                                    <button
                                        onClick={copyEmail}
                                        className="p-1 hover:bg-gray-100 rounded-full group"
                                    >
                                        <div className="size-5 fill-[#4977ec] group-hover:fill-[#3b62c2]">
                                            {icons.clipboard}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <div className="size-5 fill-black">
                                        {icons.contact}
                                    </div>
                                </div>
                                <p className="text-gray-700">{CONTACTNUMBER}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Feedback Form */}
                <div>
                    <div className="bg-white shadow-md p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            🌟 Feedback & Suggestions
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
                        onSubmit={submitFeedback}
                        className="mt-6 bg-white px-6 py-5 pt-2 rounded-xl shadow-md"
                    >
                        {/* Email Input */}
                        <div className="mb-1">
                            <div className="bg-white z-[1] ml-2 px-2 w-fit relative top-3 font-medium">
                                <label htmlFor="email">
                                    <span className="text-red-500">*</span>{' '}
                                    Email
                                </label>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={inputs.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="shadow-md py-3 rounded-md indent-3 w-full border-[0.01rem] border-gray-500 bg-transparent"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This email will be sent along with your
                                feedback.
                            </p>
                        </div>

                        {/* Feedback Input */}
                        <div className="mb-4">
                            <div className="bg-white z-[1] ml-2 px-2 w-fit relative top-3 font-medium">
                                <label htmlFor="feedback">
                                    <span className="text-red-500">*</span>{' '}
                                    Feedback / Suggestion
                                </label>
                            </div>
                            <textarea
                                name="feedback"
                                id="feedback"
                                value={inputs.feedback}
                                onChange={handleChange}
                                placeholder="Let us know how we're doing!"
                                className="shadow-md py-3 rounded-md indent-3 w-full border-[0.01rem] border-gray-500 bg-transparent"
                                rows="4"
                                required
                            />
                        </div>

                        <Button
                            btnText="Submit"
                            type="submit"
                            className="w-full bg-[#4977ec] hover:bg-[#3b62c2] text-white py-2 rounded-md"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
