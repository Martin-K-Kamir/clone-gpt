export type DateCursor = {
    date: string;
    id: string;
};

export type PaginatedData<TData> = {
    data: TData;
    totalCount: number;
    hasNextPage: boolean;
    nextOffset?: number;
    cursor?: DateCursor;
};
