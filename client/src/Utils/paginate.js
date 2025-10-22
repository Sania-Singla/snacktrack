import { useCallback, useRef } from 'react';

/**
 * Generic Pagination Utility
 * @param {Boolean} hasNextPage - Boolean as dependency item indicating if have more results to fetch.
 * @param {Boolean} loading - Boolean indicating loading state.
 * @param {Function} setPage - State function to update the page number.
 * @returns {Function} A useCallback method to perform the page updation operation.
 */
export function paginate(hasNextPage, loading, setPage) {
    const observer = useRef();

    return useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                const lastEl = entries[0];
                if (lastEl.isIntersecting && hasNextPage) {
                    setPage((prev) => prev + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [hasNextPage]
    );
}
