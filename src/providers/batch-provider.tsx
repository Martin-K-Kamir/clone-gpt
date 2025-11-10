"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";

type BatchOperation<TData, TResult> = (data: TData[]) => Promise<TResult>;

type BatchProviderProps<TData, TResult, TError = unknown> = {
    children: React.ReactNode;
    debounceMs?: number;
    operation: BatchOperation<TData, TResult>;
    onSuccess?: (result: TResult) => void;
    onError?: (error: TError) => void;
};

type BatchContextValue<TData> = {
    isExecuting: boolean;
    addToBatch: (data: TData) => void;
    removeFromBatch: (data: TData) => void;
    clearBatch: () => void;
    getBatchSize: () => number;
    executeBatch: () => Promise<void>;
};

const BatchContext = createContext<BatchContextValue<unknown> | null>(null);

export function BatchProvider<TData, TResult, TError>({
    children,
    operation,
    debounceMs = 500,
    onSuccess,
    onError,
}: BatchProviderProps<TData, TResult, TError>) {
    const batchRef = useRef<Set<TData>>(new Set());
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const isExecutingRef = useRef(false);

    const executeBatch = useCallback(async () => {
        if (batchRef.current.size === 0 || isExecutingRef.current) return;

        isExecutingRef.current = true;
        const data = Array.from(batchRef.current);

        try {
            const result = await operation(data);
            batchRef.current.clear();
            onSuccess?.(result);
        } catch (error) {
            onError?.(error as TError);
        } finally {
            isExecutingRef.current = false;
        }
    }, [operation, onSuccess, onError]);

    const addToBatch = useCallback(
        (data: TData) => {
            batchRef.current.add(data);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                void executeBatch();
            }, debounceMs);
        },
        [debounceMs, executeBatch],
    );

    const removeFromBatch = useCallback((data: TData) => {
        batchRef.current.delete(data);
    }, []);

    const clearBatch = useCallback(() => {
        batchRef.current.clear();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const getBatchSize = useCallback(() => {
        return batchRef.current.size;
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const value: BatchContextValue<unknown> = {
        addToBatch: (data: unknown) => addToBatch(data as TData),
        removeFromBatch: (data: unknown) => removeFromBatch(data as TData),
        clearBatch,
        getBatchSize,
        executeBatch,
        isExecuting: isExecutingRef.current,
    };

    return (
        <BatchContext.Provider value={value}>{children}</BatchContext.Provider>
    );
}

export function useBatch<T>() {
    const context = useContext(BatchContext);
    if (!context) {
        throw new Error("useBatch must be used within a BatchProvider");
    }
    return context as BatchContextValue<T>;
}
