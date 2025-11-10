export type TabScope = "thisTab" | "otherTabs" | "both";

export type SyncActionProps<
    TData extends Record<string, unknown> = Record<string, never>,
> = [TData] extends [Record<string, never>]
    ? {
          scope?: TabScope;
      }
    : {
          scope?: TabScope;
      } & TData;

export type HasRequiredProps<T> = keyof Omit<T, "scope"> extends never
    ? false
    : true;

export type SyncFn<TProps, TReturn = void> =
    HasRequiredProps<TProps> extends false
        ? (props?: TProps) => TReturn
        : (props: TProps) => TReturn;

export type RevertFn = () => void;
