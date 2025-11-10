/* eslint-disable */
import React, {
    ComponentPropsWithRef,
    ElementType,
    ForwardedRef,
    forwardRef,
} from "react";

type FixedForwardRef = <T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode,
) => (props: P & React.RefAttributes<T>) => React.ReactNode;

const fixedForwardRef = forwardRef as FixedForwardRef;

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends any
    ? Omit<T, TOmitted>
    : never;

export const UnwrappedAnyComponent = <TAs extends ElementType>(
    props: {
        as?: TAs;
    } & DistributiveOmit<
        ComponentPropsWithRef<ElementType extends TAs ? "div" : TAs>,
        "as"
    >,
    ref: ForwardedRef<any>,
) => {
    const { as: Comp = "div", ...rest } = props;
    return <Comp {...rest} ref={ref}></Comp>;
};

export const AnyComponent = fixedForwardRef(UnwrappedAnyComponent);
