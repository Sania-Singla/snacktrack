import { PackagedItemView } from '../../Components';
import { useSnackContext, useSearchContext } from '../../Contexts';

export default function PackagedItems() {
    const { items } = useSnackContext();
    const { search } = useSearchContext();

    const itemElements = items
        ?.filter(
            (item) =>
                !search ||
                item.name?.toLowerCase().includes(search.toLowerCase())
        )
        .map((item) => <PackagedItemView key={item._id} item={item} />);

    return (
        <>
            {itemElements.length > 0 ? (
                <div
                    className={`grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]`}
                >
                    {itemElements}
                </div>
            ) : (
                <div className="italic text-gray-600">No Items Found</div>
            )}
        </>
    );
}
