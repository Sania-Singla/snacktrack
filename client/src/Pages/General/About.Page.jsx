import { icons } from '../../Assets/icons';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
            <h1 className="text-3xl font-semibold mb-6 text-[#4977ec]">
                About SnackTrack
            </h1>

            <p className="mb-4">
                <strong>SnackTrack</strong> is an official student portal
                developed for the{' '}
                <strong>
                    University Institute of Engineering and Technology (UIET)
                </strong>
                ,<strong> Panjab University, Chandigarh</strong>. It helps
                students manage their hostel cafeteria registrations, track
                payments, and receive important university notifications.
            </p>

            <p className="mb-4">
                The portal is used exclusively by UIET students and officials.
                Each student account is verified through university records, and
                all access is securely managed through university-approved
                authentication systems.
            </p>

            <p className="mb-4">
                SnackTrack is part of an internal student-service initiative led
                by the Department of Computer Science & Engineering, UIET.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">Key Features</h2>
            <ul className="list-disc list-inside space-y-2">
                <li>Student and cafeteria registration.</li>
                <li>Password-protected student accounts.</li>
                <li>Automated password reset and update notifications.</li>
                <li>
                    Transparent snack/meal billing and contractor management.
                </li>
            </ul>

            <p className="mt-8">
                For more information about the institute, visit the official
                UIET website:{' '}
                <a
                    href="https://uiet.puchd.ac.in"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4977ec] hover:underline flex gap-2 items-center"
                >
                    <span>https://uiet.puchd.ac.in</span>
                    <div className="fill-[#4977ec] size-4">{icons.link}</div>
                </a>
            </p>
        </div>
    );
}
