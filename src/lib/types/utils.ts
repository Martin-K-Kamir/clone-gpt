/* eslint-disable @typescript-eslint/no-explicit-any */

declare const brand: unique symbol;

export type Brand<T, TBrand> = T & { [brand]: TBrand };
