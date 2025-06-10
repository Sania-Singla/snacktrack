import { SnackView } from '../../Components';
import { useSnackContext, useSearchContext } from '../../Contexts';

export default function Snacks() {
    const { snacks } = useSnackContext();
    const { search } = useSearchContext();

    const snackElements = snacks
        ?.filter(
            (snack) =>
                !search ||
                snack.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((snack) => <SnackView key={snack._id} snack={snack} />);

    return (
        <>
            {snackElements.length > 0 ? (
                <div
                    className={`grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]`}
                >
                    {snackElements}
                </div>
            ) : (
                <div className="italic text-gray-600">No Snacks Found</div>
            )}
        </>
    );
}
