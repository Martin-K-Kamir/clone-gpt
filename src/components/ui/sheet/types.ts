import { SHEET_CONTROL_MODE, SHEET_SIDE, SHEET_VIEW_STATE } from "./constants";

export type SheetViewState =
    (typeof SHEET_VIEW_STATE)[keyof typeof SHEET_VIEW_STATE];
export type SheetControlMode =
    (typeof SHEET_CONTROL_MODE)[keyof typeof SHEET_CONTROL_MODE];
export type SheetSide = (typeof SHEET_SIDE)[keyof typeof SHEET_SIDE];
