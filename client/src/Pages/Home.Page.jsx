import { useSearchParams } from 'react-router-dom';
import { AddBtn, Snacks, PackagedItems, Filters } from '../Components';
import { useUserContext } from '../Contexts';

export default function HomePage() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks';
    const { user } = useUserContext();

    return (
        <div className="pl-2">
            <div className="mb-6 flex justify-between items-center">
                {user?.role === 'contractor' && <AddBtn />}

                {user?.role === 'student' && (
                    <p className="hidden sm:block italic font-serif text-gray-500 text-nowrap">
                        Hi {user.fullName.split(' ')[0]} !! What's on your mind
                        today?
                    </p>
                )}

                {!user && (
                    <p className="italic font-serif text-gray-500 text-nowrap">
                        Hi !! What's on your mind today?
                    </p>
                )}

                <Filters />
            </div>

            {filter === 'snacks' ? <Snacks /> : <PackagedItems />}
        </div>
    );
}
