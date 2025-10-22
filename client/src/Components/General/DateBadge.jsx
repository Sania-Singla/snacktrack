import { useOrderContext } from '../../Contexts';

export default function DateBadge() {
    const { dateFilter } = useOrderContext();

    return (
        <div className="rounded-full text-xs font-semibold text-[#4977ec] bg-blue-50 border-1 border-[#4977ec] py-0.5 px-2">
            {!dateFilter ||
            dateFilter === new Date().toLocaleDateString('en-CA')
                ? 'Today'
                : new Date(dateFilter).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                  })}
        </div>
    );
}
