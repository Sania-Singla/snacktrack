import { useEffect, useMemo, useState, useCallback } from 'react';
import { contractorService } from '../Services';
import { paginate, checkTokenExpired, getRollNo } from '../Utils';
import { useNavigate } from 'react-router-dom';
import {
    useStudentContext,
    usePopupContext,
    useSearchContext,
    useUserContext,
} from '../Contexts';
import { Button, StudentView } from '../Components';
import { icons } from '../Assets/icons';

export default function StudentsPage() {
    const { students, setStudents, studentsInfo, setStudentsInfo } =
        useStudentContext();
    const { setPopupInfo, setShowPopup } = usePopupContext();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { search } = useSearchContext();
    const navigate = useNavigate();
    const { setUser } = useUserContext();
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    // pagination
    const paginateRef = paginate(studentsInfo?.hasNextPage, loading, setPage);

    const fetchStudents = useCallback(
        async (signal, currentPage = 1) => {
            try {
                setLoading(true);
                if (currentPage === 1) setStudents([]);
                const res = await contractorService.getStudents({
                    signal,
                    page: currentPage,
                    search: debouncedSearch,
                });
                if (res && !res.message) {
                    if (currentPage === 1) {
                        setStudents(res.students);
                    } else {
                        setStudents((prev) => prev.concat(res.students));
                    }
                    setStudentsInfo(res.studentsInfo);
                } else {
                    checkTokenExpired(res, setUser);
                }
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        },
        [debouncedSearch, setStudents, setStudentsInfo, setUser, navigate]
    );

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        fetchStudents(signal);

        return () => controller.abort();
    }, [debouncedSearch, fetchStudents]);

    useEffect(() => {
        if (page === 1) return;

        const controller = new AbortController();
        const signal = controller.signal;

        fetchStudents(signal, page);

        return () => controller.abort();
    }, [page, fetchStudents]);

    useEffect(() => {
        if (search !== debouncedSearch) setLoading(true);
    }, [search]);

    const studentElements = useMemo(() => {
        return students?.map((student, i) => (
            <StudentView
                key={student._id}
                student={student}
                reference={
                    i + 1 === students.length && studentsInfo?.hasNextPage
                        ? paginateRef
                        : null
                }
            />
        ));
    }, [students, studentsInfo, paginateRef]);

    async function removeAllStudents() {
        setPopupInfo({ type: 'removeAllStudents' });
        setShowPopup(true);
    }

    return (
        <div className="sm:p-4 pt-2">
            {studentElements.length > 0 && (
                <div className="w-full">
                    <div className=" w-full flex justify-between gap-4 mb-8">
                        <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-medium text-gray-800">
                                    Total Students
                                </h3>
                                <div className="size-6 rounded-full bg-blue-50 text-sm flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">
                                        {studentsInfo?.totalCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            title="Remove all Students"
                            onClick={removeAllStudents}
                            btnText={
                                <div className="flex gap-2 items-center justify-center px-1">
                                    <div className="size-[16px] fill-white group-hover:fill-red-700">
                                        {icons.delete}
                                    </div>
                                    <p>Remove All Students</p>
                                </div>
                            }
                            className="bg-red-600  shadow-sm hover:bg-red-700 text-white p-2 h-fit rounded-lg"
                        />
                    </div>

                    <div
                        className={`grid gap-6 ${studentElements.length <= 1 ? 'grid-cols-[repeat(auto-fit,minmax(350px,550px))]' : 'grid-cols-[repeat(auto-fit,minmax(350px,1fr))]'}`}
                    >
                        {studentElements}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                studentElements.length === 0 && (
                    <div className="italic text-gray-600">
                        No student found !!
                    </div>
                )
            )}
        </div>
    );
}
