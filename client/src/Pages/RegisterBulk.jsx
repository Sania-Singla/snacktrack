import { useState } from 'react';
import { contractorService } from '../Services';
import toast from 'react-hot-toast';

export default function RegisterBulk() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }

        setLoading(true);

        try {
            const res = await contractorService.registerBulk(file);
            if (res instanceof Response) {
                // It's a file
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students_result.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                toast.success('Bulk registration successful!');
            } else {
                // It's JSON
                toast.error(res.message || 'No new users to register');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error uploading or downloading file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">
                Bulk Student Registration
            </h2>

            <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="border p-2 rounded mb-3"
            />
            <br />
            <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? 'Uploading...' : 'Upload & Download Result'}
            </button>
        </div>
    );
}
