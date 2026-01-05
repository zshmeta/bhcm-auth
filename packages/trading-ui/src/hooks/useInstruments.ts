/**
 * useInstruments Hook
 * 
 * Provides instrument data and filtering.
 */

import { useState, useCallback, useMemo } from 'react';
import type { AnyInstrument, InstrumentCategory } from '../types';
import {
    ALL_INSTRUMENTS,
    getInstrumentsByCategory,
    getInstrumentBySymbol
} from '../mocks';

interface UseInstrumentsOptions {
    /** Initial category filter */
    initialCategory?: InstrumentCategory | 'all';
    /** Initial search query */
    initialSearch?: string;
}

interface UseInstrumentsReturn {
    /** All instruments (unfiltered) */
    allInstruments: AnyInstrument[];
    /** Filtered instruments based on category and search */
    instruments: AnyInstrument[];
    /** Currently selected category */
    category: InstrumentCategory | 'all';
    /** Current search query */
    searchQuery: string;
    /** Set category filter */
    setCategory: (category: InstrumentCategory | 'all') => void;
    /** Set search query */
    setSearchQuery: (query: string) => void;
    /** Get instrument by symbol */
    getInstrument: (symbol: string) => AnyInstrument | undefined;
    /** Available categories */
    categories: (InstrumentCategory | 'all')[];
}

const CATEGORIES: (InstrumentCategory | 'all')[] = [
    'all',
    'fx',
    'crypto',
    'stocks',
    'commodities',
];

/**
 * Hook for instruments data with filtering.
 * 
 * @param options - Configuration options
 * @returns Instruments data and filter controls
 * 
 * @example
 * ```tsx
 * const { instruments, setCategory, setSearchQuery } = useInstruments();
 * ```
 */
export function useInstruments(
    options: UseInstrumentsOptions = {}
): UseInstrumentsReturn {
    const { initialCategory = 'all', initialSearch = '' } = options;

    const [category, setCategory] = useState<InstrumentCategory | 'all'>(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    const allInstruments = useMemo(() => ALL_INSTRUMENTS, []);

    const instruments = useMemo(() => {
        let filtered = category === 'all'
            ? allInstruments
            : getInstrumentsByCategory(category);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                inst =>
                    inst.symbol.toLowerCase().includes(query) ||
                    inst.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [allInstruments, category, searchQuery]);

    const getInstrument = useCallback((symbol: string) => {
        return getInstrumentBySymbol(symbol);
    }, []);

    return {
        allInstruments,
        instruments,
        category,
        searchQuery,
        setCategory,
        setSearchQuery,
        getInstrument,
        categories: CATEGORIES,
    };
}
