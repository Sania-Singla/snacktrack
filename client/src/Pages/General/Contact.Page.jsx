export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
            <h1 className="text-3xl font-semibold mb-6 text-[#4977ec]">
                Contact Us
            </h1>

            <p className="mb-6">
                If you have questions, feedback, or technical issues with
                SnackTrack, please reach out using the details below.
            </p>

            <div className="space-y-4">
                {/* <p>
                    <strong>Support Email:</strong>{' '}
                    <a
                        href="mailto:support@snacktrack.live"
                        className="text-[#4977ec] hover:underline"
                    >
                        support@snacktrack.live
                    </a>
                </p>

                <p>
                    <strong>Alternate Email (Faculty/Technical Team):</strong>{' '}
                    <a
                        href="mailto:cse@uiet.puchd.ac.in"
                        className="text-[#4977ec] hover:underline"
                    >
                        cse@uiet.puchd.ac.in
                    </a>
                </p> */}

                <p>
                    <strong>Department:</strong> Computer Science & Engineering,
                    UIET
                    <br />
                    <strong>Institution:</strong> Panjab University, Chandigarh
                    – 160014
                </p>

                <p>
                    <strong>Official Websites:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                            <a
                                href="https://pu.snacktrack.live"
                                className="text-[#4977ec] hover:underline"
                            >
                                https://pu.snacktrack.live
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://uiet.puchd.ac.in"
                                className="text-[#4977ec] hover:underline"
                            >
                                https://uiet.puchd.ac.in
                            </a>
                        </li>
                    </ul>
                </p>
            </div>
        </div>
    );
}
