import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../Services';
import { Button, StudentBillCard } from '../Components';
import { checkTokenExpired, getRollNo, paginate } from '../Utils';
import { LIMIT } from '../Constants/constants';
import { icons } from '../Assets/icons';
import { useSearchContext, useUserContext } from '../Contexts';
import toast from 'react-hot-toast';

export default function BillsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [studentsInfo, setStudentsInfo] = useState({});
    const { search } = useSearchContext();
    const { setUser } = useUserContext();
    const [generatingBills, setGeneratingBills] = useState(false);

    const paginateRef = paginate(studentsInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await billService.getBills(page, LIMIT, signal);
                if (res && !res.message) {
                    setStudents((prev) => prev.concat(res.students));
                    setStudentsInfo(res.studentsInfo);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page]);

    async function generateBills() {
        try {
            setGeneratingBills(true);
            const res = await billService.generateBills();
            if (res && res.message === 'bills generated') {
                toast.success('Bills generated successfully, please refresh');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setGeneratingBills(false);
        }
    }

    const studentElements = useMemo(() => {
        return students
            .filter(
                (s) =>
                    !search ||
                    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    getRollNo(s.userName)
                        .toLowerCase()
                        .includes(search.toLowerCase())
            )
            .map((s, i) => (
                <StudentBillCard
                    reference={
                        i + 1 === students.length && studentsInfo?.hasNextPage
                            ? paginateRef
                            : null
                    }
                    key={s._id}
                    student={s}
                />
            ));
    }, [students, search, studentsInfo?.hasNextPage, paginateRef]);

    return (
        <div>
            <div className="w-full pt-2 sm:p-4">
                <div className="flex items-center justify-between w-full mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Bills
                        </h1>
                        <div className="px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            {new Date().toLocaleDateString('default', {
                                month: 'long',
                            })}
                        </div>
                    </div>

                    <Button
                        onClick={generateBills}
                        className="text-white rounded-md py-2 px-4 mt-2 h-[40px] flex items-center justify-center text-lg transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]"
                        btnText={
                            generatingBills ? (
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            ) : (
                                `Generate Bills for ${new Date(
                                    new Date().getFullYear(),
                                    new Date().getMonth() - 1,
                                    1
                                ).toLocaleDateString('default', {
                                    month: 'long',
                                })}`
                            )
                        }
                    />
                </div>

                {studentElements.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {studentElements}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                            {icons.loading}
                        </div>
                    </div>
                ) : (
                    studentElements.length === 0 && <div>No students found</div>
                )}
            </div>
        </div>
    );
}
