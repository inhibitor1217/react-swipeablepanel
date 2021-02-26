import React from "react";
import { Axis } from "../types/axis";
import { Duration } from "../utils/duration";
interface SwipeablePanelHelperComponentProps {
    length: number;
    currentPage: number;
}
interface SwipeablePanelProps {
    loop?: boolean;
    auto?: boolean;
    autoSlideInterval?: Duration;
    animationDuration?: Duration;
    axis: Axis;
    widgets?: React.FC<SwipeablePanelHelperComponentProps>[];
    initialPage?: number;
    onPageChanged?(index: number): void;
}
export declare const SwipeablePanel: React.FC<SwipeablePanelProps>;
export {};
