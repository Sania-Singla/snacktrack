import { useEffect, useState } from 'react';
import { contractorService } from '../Services';
import { paginate, checkTokenExpired } from '../Utils';
import { useSearchContext, useUserContext } from '../Contexts';
import { StudentView } from '../Components';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';

export default function StudentsPage() {
    const [studentsInfo, setStudentsInfo] = useState({});
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { debouncedSearch } = useSearchContext();
    const { setUser } = useUserContext();

    const paginateRef = paginate(studentsInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await contractorService.getStudents({
                    signal,
                    page,
                    search: debouncedSearch,
                });
                if (res && !res.message) {
                    setStudentsInfo(res.studentsInfo);

                    if (page === 1) {
                        setStudents(res.students);
                    } else {
                        setStudents((prev) => prev.concat(res.students));
                    }
                } else {
                    checkTokenExpired(res, setUser);
                }
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, debouncedSearch]);

    return (
        <>
            <div className=" w-full flex justify-between gap-4 mb-6">
                <div className="bg-white px-3 py-1.5 text-sm rounded-md border-1 border-gray-200">
                    <div className="pl-2 flex items-center justify-between gap-2.5">
                        <h3 className="font-medium text-gray-800">
                            Total Students
                        </h3>
                        <span className="text-blue-600 font-medium">
                            {studentsInfo?.totalCount || 0}
                        </span>
                    </div>
                </div>

                {/* {students.length > 0 && (
                    <Button
                        title="Remove all Students"
                        onClick={() => {
                            setPopupInfo({ type: 'removeAllStudents' });
                            setShowPopup(true);
                        }}
                        btnText={
                            <div className="flex gap-2 items-center justify-center px-1">
                                <div className="size-3.5 fill-white group-hover:fill-red-700">
                                    {icons.delete}
                                </div>
                                <p>Delete All</p>
                            </div>
                        }
                        className="bg-red-600 text-sm shadow-sm hover:bg-red-700 text-white p-2 h-fit rounded-md"
                    />
                )} */}
            </div>

            {students.length > 0 && (
                <div
                    className={`grid gap-4 ${students.length <= 1 ? 'grid-cols-[repeat(auto-fit,minmax(350px,550px))]' : 'grid-cols-[repeat(auto-fit,minmax(350px,1fr))]'}`}
                >
                    {students?.map((student, i) => (
                        <StudentView
                            key={student._id}
                            student={student}
                            reference={
                                i + 1 === students.length &&
                                studentsInfo?.hasNextPage
                                    ? paginateRef
                                    : null
                            }
                        />
                    ))}
                </div>
            )}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                students.length === 0 && (
                    <div className="italic text-gray-400 text-center">
                        No student found
                    </div>
                )
            )}
        </>
    );
}
