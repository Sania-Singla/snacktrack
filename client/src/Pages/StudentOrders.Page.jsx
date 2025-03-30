import { useParams } from 'react-router-dom';

export default function StudentOrdersPage() {
    const { studentId } = useParams();

    return (
        <div>
            particular student's orders filtered by month for that year only not
            past years.
        </div>
    );
}
