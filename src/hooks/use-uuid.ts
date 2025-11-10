import { useCallback, useRef } from "react";

export function useUuid<TUuid extends string>() {
    const uuidRef = useRef<TUuid | undefined>(undefined);

    const getId = useCallback(() => {
        if (!uuidRef.current) {
            uuidRef.current = crypto.randomUUID() as TUuid;
        }

        return uuidRef.current;
    }, []);

    return getId;
}
