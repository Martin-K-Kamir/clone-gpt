import { DateCursor } from "./pagination";
import { OrderBy } from "./query-params";

export type WithName = {
    name: string;
};

export type WithNewName = {
    newName: string;
};

export type WithTitle = {
    title: string;
};

export type WithNewTitle = {
    newTitle: string;
};

export type WithReadonly = {
    isReadonly: boolean;
};

export type WithQuery = {
    query: string;
};

export type WithFile = {
    file: File;
};

export type WithFilename = {
    filename: string;
};

export type WithPrompt = {
    prompt: string;
};

export type WithFiles = {
    files: File[];
};

export type WithExtension = {
    extension: string;
};

export type WithContentType = {
    contentType: string;
};

export type WithUrl = {
    url: string;
};

export type WithOptionalOffset = {
    offset?: number;
};

export type WithOptionalLimit = {
    limit?: number;
};

export type WithOptionalOrderBy = {
    orderBy?: OrderBy;
};

export type WithOptionalFrom = {
    from?: Date | string;
};

export type WithOptionalFromDate = {
    from?: Date;
};

export type WithOptionalTo = {
    to?: Date | string;
};

export type WithOptionalToDate = {
    to?: Date;
};

export type WithOptionalCheckAccess = {
    checkAccess?: boolean;
};

export type WithOptionalCursor = {
    cursor?: DateCursor;
};

export type WithOptionalQuery = {
    query?: string;
};

export type WithOptionalThrowOnNotFound = {
    throwOnNotFound?: boolean;
};
