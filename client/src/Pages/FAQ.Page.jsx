import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { icons } from '../Assets/icons';

export default function FAQpage() {
    const [expanded, setExpanded] = useState(null);

    const toggleExpand = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    const faqs = [
        {
            question: 'What is the purpose of this website?',
            answer: "This website provides transparency on the hostel canteen's menu, pricing, and food availability. Students can check daily menus, place orders, and give feedback.",
        },
        {
            question: 'How can I view the daily menu?',
            answer: "The daily menu is updated every morning on the homepage. You can also check it under the 'Menu' section.",
        },
        {
            question: 'Are vegetarian and vegan options available?',
            answer: 'Yes! The canteen offers vegetarian, vegan, and Jain food options. You can filter the menu based on your dietary needs.',
        },
        {
            question: 'How do I report a food quality issue?',
            answer: "Use the 'Feedback' section to report any issues. Your complaint will be reviewed by the canteen management team.",
        },
        {
            question: 'Can I pre-order my meals?',
            answer: 'Yes! You can pre-order meals through the website and pick them up at your preferred time.',
        },
        {
            question: 'How do I check my meal balance?',
            answer: "Check your meal balance under the 'My Account' section in 'Meal Credits'.",
        },
        {
            question: 'Are there any special discounts for students?',
            answer: 'Yes! Occasionally, we offer discounts and meal packages. Check the homepage for updates.',
        },
        {
            question: 'How often is the menu updated?',
            answer: 'The menu is updated daily based on availability and seasonal ingredients.',
        },
        {
            question: 'What payment methods are accepted?',
            answer: 'We accept UPI, credit/debit cards, and hostel meal credits.',
        },
        {
            question: 'Who can I contact for additional queries?',
            answer: "Visit the 'Contact Us' page or reach out to hostel management.",
        },
    ];

    return (
        <div className="w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#f9f9f9] to-[#f2f2f2] rounded-xl">
            {/* Page Header */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-gray-900 text-center"
            >
                Frequently Asked Questions
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-lg text-gray-600 text-center mt-2 max-w-2xl"
            >
                Find answers to the most commonly asked questions about our
                services.
            </motion.p>

            {/* FAQ List */}
            <div className="w-full max-w-3xl mt-8 space-y-4">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        className="bg-white/50 backdrop-blur-lg border border-gray-200 shadow-lg p-5 rounded-lg cursor-pointer transition-transform hover:scale-[1.02]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => toggleExpand(index)}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {faq.question}
                            </h2>

                            <motion.div
                                animate={{
                                    rotate: expanded === index ? -45 : 0,
                                }}
                                transition={{ duration: 0.1 }}
                                className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
                            >
                                <div className="size-[16px]">{icons.plus}</div>
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {expanded === index && (
                                <motion.div
                                    className="mt-2 text-gray-600 overflow-hidden"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                        opacity: { duration: 0.2 },
                                        height: { duration: 0.2 },
                                    }}
                                >
                                    {faq.answer}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
