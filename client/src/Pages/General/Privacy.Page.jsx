export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
            <h1 className="text-3xl font-semibold mb-6 text-[#4977ec]">
                Privacy Policy
            </h1>

            <p className="mb-4">
                SnackTrack (
                <a
                    href="https://pu.snacktrack.live"
                    className="text-[#4977ec] hover:underline"
                >
                    https://pu.snacktrack.live
                </a>
                ) is a web portal designed for students and staff of the{' '}
                <strong>
                    University Institute of Engineering and Technology (UIET),
                    Panjab University
                </strong>
                .
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">
                Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2">
                <li>Name and Registered Email Address</li>
                <li>Hostel/Department details</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-3">
                How We Use This Information
            </h2>
            <p className="mb-3">We use your information solely for:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>Creating and managing your SnackTrack account</li>
                <li>
                    Sending transactional emails (registration, password resets,
                    updates)
                </li>
                <li>Providing hostel and contractor management services</li>
            </ul>

            <p className="mt-4">
                We <strong>do not</strong> share, sell, or rent your data to any
                third party.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">
                Email Communication
            </h2>
            <p className="mb-4">
                We send only transactional or administrative emails such as
                registration credentials, password reset links, or important
                updates. We never send promotional or marketing content.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">Data Security</h2>
            <p className="mb-4">
                All data is transmitted securely (HTTPS) and stored on encrypted
                servers. Passwords are hashed before storage.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">Data Retention</h2>
            <p className="mb-4">
                Your information remains stored while your student account is
                active. After graduation or account deactivation, your data may
                be archived or deleted per university policy.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">Contact</h2>
            <p className="mb-4">
                For privacy-related concerns, contact us at{' '}
                <a
                    href="mailto:support@snacktrack.live"
                    className="text-[#4977ec] hover:underline"
                >
                    support@snacktrack.live
                </a>
                .
            </p>

            <p className="text-sm text-gray-500 mt-8">
                Last updated: October 2025
            </p>
        </div>
    );
}
