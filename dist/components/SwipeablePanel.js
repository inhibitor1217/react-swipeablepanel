var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";
import { Axis } from "../types/axis";
import { Duration } from "../utils/duration";
var MovementDirection;
(function (MovementDirection) {
    MovementDirection["UP"] = "UP";
    MovementDirection["DOWN"] = "DOWN";
    MovementDirection["LEFT"] = "LEFT";
    MovementDirection["RIGHT"] = "RIGHT";
})(MovementDirection || (MovementDirection = {}));
var PAGE_MOVE_THRESHOLD = 0.2;
function computeSizeOf(node) {
    var _a = window.getComputedStyle(node), widthPx = _a.width, heightPx = _a.height;
    return {
        width: parseFloat(widthPx.split("px")[0]),
        height: parseFloat(heightPx.split("px")[0]),
    };
}
function setOpacityOf(node, isOpaque) {
    if (!node) {
        return;
    }
    node.style.opacity = isOpaque ? "1" : "0";
}
function updatePositionOf(node, position, animationDuration) {
    if (animationDuration === void 0) { animationDuration = Duration.ZERO; }
    if (!node) {
        return;
    }
    node.style.transitionDuration = animationDuration.inMilliseconds() + "ms";
    node.style.transform = "translate(" + position.x + "px, " + position.y + "px)";
}
function extractPositionFrom(e) {
    switch (e.type) {
        case "touchstart":
        case "touchmove":
        case "touchend": {
            var _a = e.touches[0], pageX = _a.pageX, pageY = _a.pageY;
            return {
                x: pageX,
                y: pageY,
            };
        }
        case "mousedown":
        case "mousemove":
        case "mouseup": {
            var _b = e, pageX = _b.pageX, pageY = _b.pageY;
            return {
                x: pageX,
                y: pageY,
            };
        }
        default:
            throw new Error("unsupported event type: " + e.type);
    }
}
function determinePage(delta, frameSize, state) {
    var dx = delta.dx, dy = delta.dy;
    var width = frameSize.width, height = frameSize.height;
    var axis = state.axis, loop = state.loop, currentPage = state.currentPage, numPages = state.numPages;
    switch (axis) {
        case Axis.horizontal: {
            var isOverThreshold = Math.abs(dx / width) >= PAGE_MOVE_THRESHOLD;
            if (!isOverThreshold) {
                var attemptedDirection = dx >= 0 ? MovementDirection.RIGHT : MovementDirection.LEFT;
                return { newPage: currentPage, direction: null, attemptedDirection: attemptedDirection };
            }
            if (dx < 0) {
                var hasNextPage = currentPage < numPages - 1;
                return loop || hasNextPage
                    ? {
                        newPage: (currentPage + 1) % numPages,
                        direction: MovementDirection.RIGHT,
                        attemptedDirection: MovementDirection.RIGHT,
                    }
                    : {
                        newPage: currentPage,
                        direction: null,
                        attemptedDirection: MovementDirection.RIGHT,
                    };
            }
            else {
                var hasPreviousPage = currentPage > 0;
                return loop || hasPreviousPage
                    ? {
                        newPage: (currentPage + numPages - 1) % numPages,
                        direction: MovementDirection.LEFT,
                        attemptedDirection: MovementDirection.LEFT,
                    }
                    : {
                        newPage: currentPage,
                        direction: null,
                        attemptedDirection: MovementDirection.LEFT,
                    };
            }
        }
        case Axis.vertical: {
            var isOverThreshold = Math.abs(dy / height) >= PAGE_MOVE_THRESHOLD;
            if (!isOverThreshold) {
                var attemptedDirection = dy >= 0 ? MovementDirection.UP : MovementDirection.DOWN;
                return { newPage: currentPage, direction: null, attemptedDirection: attemptedDirection };
            }
            if (dy < 0) {
                var hasNextPage = currentPage < numPages - 1;
                return loop || hasNextPage
                    ? {
                        newPage: (currentPage + 1) % numPages,
                        direction: MovementDirection.DOWN,
                        attemptedDirection: MovementDirection.DOWN,
                    }
                    : {
                        newPage: currentPage,
                        direction: null,
                        attemptedDirection: MovementDirection.DOWN,
                    };
            }
            else {
                var hasPreviousPage = currentPage > 0;
                return loop || hasPreviousPage
                    ? {
                        newPage: (currentPage + numPages - 1) % numPages,
                        direction: MovementDirection.UP,
                        attemptedDirection: MovementDirection.UP,
                    }
                    : {
                        newPage: currentPage,
                        direction: null,
                        attemptedDirection: MovementDirection.UP,
                    };
            }
        }
        default:
            throw new Error('unreachable code');
    }
}
function asymptoticValue(x, halfWhen, maxValue) {
    return maxValue * (Math.atan(x / halfWhen) / (0.5 * Math.PI));
}
function isAdjacent(index, currentPage, numPages, loop) {
    if (Math.abs(index - currentPage) <= 1) {
        return true;
    }
    if (loop && (currentPage === 0 && index === numPages - 1 ||
        currentPage === numPages - 1 && index === 0)) {
        return true;
    }
    return false;
}
var StyledWrapper = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n"], ["\n  width: 100%;\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n"])));
var StyledPanel = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  overflow: hidden;\n  transition-property: transform;\n  transition-timing-function: ease;\n"], ["\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  overflow: hidden;\n  transition-property: transform;\n  transition-timing-function: ease;\n"])));
export var SwipeablePanel = function (_a) {
    var _b;
    var _c = _a.loop, loop = _c === void 0 ? false : _c, _d = _a.auto, auto = _d === void 0 ? false : _d, _e = _a.autoSlideInterval, autoSlideInterval = _e === void 0 ? Duration.from({ seconds: 5 }) : _e, _f = _a.animationDuration, animationDuration = _f === void 0 ? Duration.from({ milliseconds: 500 }) : _f, axis = _a.axis, children = _a.children, widgets = _a.widgets, _g = _a.initialPage, initialPage = _g === void 0 ? 0 : _g, onPageChanged = _a.onPageChanged;
    var _h = React.useState(initialPage), currentPage = _h[0], setCurrentPage = _h[1];
    var panels = (_b = React.Children.toArray(children)) !== null && _b !== void 0 ? _b : [];
    var numPanels = panels.length;
    var _j = React.useState(null), wrapperNode = _j[0], setWrapperNode = _j[1];
    var _k = React.useState(null), wrapperSize = _k[0], setWrapperSize = _k[1];
    var _l = React.useState([]), panelNodeRefs = _l[0], setPanelNodeRefs = _l[1];
    var mousePositionRef = React.useRef(null);
    var mouseDeltaPositionRef = React.useRef(null);
    var autoSlideTimeoutRef = React.useRef(null);
    var getSiblingNodes = React.useCallback(function () {
        var _a, _b, _c, _d;
        var nextPage = (currentPage + 1) % numPanels;
        var previousPage = (currentPage + numPanels - 1) % numPanels;
        var hasNext = loop || currentPage + 1 < numPanels;
        var hasPrevious = loop || currentPage > 0;
        return {
            current: (_b = (_a = panelNodeRefs[currentPage]) === null || _a === void 0 ? void 0 : _a.current) !== null && _b !== void 0 ? _b : null,
            next: hasNext ? (_c = panelNodeRefs[nextPage]) === null || _c === void 0 ? void 0 : _c.current : null,
            previous: hasPrevious ? (_d = panelNodeRefs[previousPage]) === null || _d === void 0 ? void 0 : _d.current : null,
        };
    }, [panelNodeRefs, currentPage, numPanels, loop]);
    var prepareSiblingNodes = React.useCallback(function () {
        if (!wrapperSize) {
            return;
        }
        var _a = getSiblingNodes(), current = _a.current, next = _a.next, previous = _a.previous;
        var wrapperWidth = wrapperSize.width, wrapperHeight = wrapperSize.height;
        setOpacityOf(current, true);
        updatePositionOf(current, { x: 0, y: 0 });
        switch (axis) {
            case Axis.horizontal:
                setOpacityOf(previous, true);
                setOpacityOf(next, true);
                updatePositionOf(previous, { x: -wrapperWidth, y: 0 });
                updatePositionOf(next, { x: wrapperWidth, y: 0 });
                break;
            case Axis.vertical:
                setOpacityOf(previous, true);
                setOpacityOf(next, true);
                updatePositionOf(previous, { x: 0, y: -wrapperHeight });
                updatePositionOf(next, { x: 0, y: wrapperHeight });
                break;
        }
    }, [axis, wrapperSize, getSiblingNodes]);
    var handleHorizontalSwipe = React.useCallback(function (delta, e) {
        if (!wrapperSize) {
            throw new Error("size of wrapper node not available");
        }
        var shouldSwipe = axis === Axis.horizontal && Math.abs(delta.dx) > Math.abs(delta.dy);
        if (!shouldSwipe) {
            return;
        }
        if (e.cancelable) {
            e.preventDefault();
        }
        e.stopPropagation();
        var dx = delta.dx;
        var width = wrapperSize.width;
        var isMovingRight = dx < 0;
        var isOverflow = isMovingRight
            ? currentPage === numPanels - 1
            : currentPage === 0;
        var offset = isOverflow
            ? asymptoticValue(dx, 0.2 * width, 0.4 * width)
            : dx;
        var _a = getSiblingNodes(), current = _a.current, previous = _a.previous, next = _a.next;
        setOpacityOf(current, true);
        updatePositionOf(current, { x: offset, y: 0 });
        if (dx < 0) {
            setOpacityOf(next, true);
            updatePositionOf(next, { x: offset + width, y: 0 });
        }
        if (dx > 0) {
            setOpacityOf(previous, true);
            updatePositionOf(previous, { x: offset - width, y: 0 });
        }
    }, [axis, currentPage, numPanels, wrapperSize, getSiblingNodes]);
    var handleVerticalSwipe = React.useCallback(function (delta, e) {
        if (!wrapperSize) {
            throw new Error("size of wrapper node not available");
        }
        var shouldSwipe = axis === Axis.vertical && Math.abs(delta.dy) > Math.abs(delta.dx);
        if (!shouldSwipe) {
            return;
        }
        if (e.cancelable) {
            e.preventDefault();
        }
        e.stopPropagation();
        var dy = delta.dy;
        var height = wrapperSize.height;
        var isMovingUp = dy < 0;
        var isOverflow = isMovingUp
            ? currentPage === numPanels - 1
            : currentPage === 0;
        var offset = isOverflow
            ? asymptoticValue(dy, 0.2 * height, 0.4 * height)
            : dy;
        var _a = getSiblingNodes(), current = _a.current, previous = _a.previous, next = _a.next;
        setOpacityOf(current, true);
        updatePositionOf(current, { x: 0, y: offset });
        if (dy < 0) {
            setOpacityOf(next, true);
            updatePositionOf(next, { x: 0, y: offset + height });
        }
        if (dy > 0) {
            setOpacityOf(previous, true);
            updatePositionOf(previous, { x: 0, y: offset - height });
        }
    }, [axis, wrapperSize, getSiblingNodes]);
    var handleMove = React.useCallback(function (position, e) {
        if (numPanels < 2) {
            return;
        }
        if (!mousePositionRef.current) {
            throw new Error("start position not available: invalid state");
        }
        var x = position.x, y = position.y;
        var _a = mousePositionRef.current, startX = _a.x, startY = _a.y;
        var dx = x - startX;
        var dy = y - startY;
        mouseDeltaPositionRef.current = { dx: dx, dy: dy };
        handleHorizontalSwipe({ dx: dx, dy: dy }, e);
        handleVerticalSwipe({ dx: dx, dy: dy }, e);
    }, [axis, handleHorizontalSwipe, handleVerticalSwipe]);
    var onWrapperTouchMove = React.useCallback(function (e) {
        if (e.touches && e.touches.length > 1) {
            return;
        }
        handleMove(extractPositionFrom(e), e);
    }, [handleMove]);
    var onWrapperMouseMove = React.useCallback(function (e) {
        if (!mousePositionRef.current) {
            throw new Error("start position not available: invalid state");
        }
        handleMove(extractPositionFrom(e), e);
    }, [handleMove]);
    var moveTowards = React.useCallback(function (direction, attemptedDirection) {
        if (!wrapperSize) {
            throw new Error("size of wrapper node not available");
        }
        var width = wrapperSize.width, height = wrapperSize.height;
        var _a = getSiblingNodes(), current = _a.current, next = _a.next, previous = _a.previous;
        if (direction !== null) {
            switch (direction) {
                case MovementDirection.RIGHT:
                    updatePositionOf(current, { x: -width, y: 0 }, animationDuration);
                    updatePositionOf(next, { x: 0, y: 0 }, animationDuration);
                    break;
                case MovementDirection.LEFT:
                    updatePositionOf(current, { x: width, y: 0 }, animationDuration);
                    updatePositionOf(previous, { x: 0, y: 0 }, animationDuration);
                    break;
                case MovementDirection.DOWN:
                    updatePositionOf(current, { x: 0, y: -height }, animationDuration);
                    updatePositionOf(next, { x: 0, y: 0 }, animationDuration);
                    break;
                case MovementDirection.UP:
                    updatePositionOf(current, { x: 0, y: height }, animationDuration);
                    updatePositionOf(previous, { x: 0, y: 0 }, animationDuration);
                    break;
            }
        }
        else {
            updatePositionOf(current, { x: 0, y: 0 }, animationDuration);
            switch (axis) {
                case Axis.horizontal:
                    if (attemptedDirection === MovementDirection.LEFT) {
                        updatePositionOf(next, { x: width, y: 0 }, animationDuration);
                    }
                    if (attemptedDirection === MovementDirection.RIGHT) {
                        updatePositionOf(previous, { x: -width, y: 0 }, animationDuration);
                    }
                    break;
                case Axis.vertical:
                    if (attemptedDirection === MovementDirection.DOWN) {
                        updatePositionOf(next, { x: 0, y: height }, animationDuration);
                    }
                    if (attemptedDirection === MovementDirection.UP) {
                        updatePositionOf(previous, { x: 0, y: -height }, animationDuration);
                    }
            }
        }
    }, [axis, wrapperSize, getSiblingNodes]);
    var handleEnd = React.useCallback(function () {
        if (numPanels < 2) {
            return;
        }
        if (!mouseDeltaPositionRef.current) {
            throw new Error("delta position not available: invalid state");
        }
        if (!wrapperSize) {
            throw new Error("size of wrapper node not available");
        }
        var delta = mouseDeltaPositionRef.current;
        var _a = determinePage(delta, wrapperSize, {
            axis: axis,
            loop: loop,
            currentPage: currentPage,
            numPages: numPanels,
        }), newPage = _a.newPage, direction = _a.direction, attemptedDirection = _a.attemptedDirection;
        setCurrentPage(newPage);
        moveTowards(direction, attemptedDirection);
    }, [axis, loop, currentPage, numPanels, wrapperSize]);
    var onWrapperTouchEnd = React.useCallback(function () {
        handleEnd();
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.removeEventListener("touchmove", onWrapperTouchMove, {
            capture: true,
        });
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.removeEventListener("touchend", onWrapperTouchEnd, {
            capture: true,
        });
    }, [wrapperNode, onWrapperTouchMove, handleEnd]);
    var onWrapperMouseUp = React.useCallback(function () {
        handleEnd();
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.removeEventListener("mousemove", onWrapperMouseMove, {
            capture: true,
        });
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.removeEventListener("mouseup", onWrapperMouseUp, {
            capture: true,
        });
    }, [wrapperNode, onWrapperMouseMove, handleEnd]);
    var handleStart = React.useCallback(function (e) {
        if (numPanels < 2) {
            return;
        }
        prepareSiblingNodes();
        var _a = extractPositionFrom(e), x = _a.x, y = _a.y;
        mousePositionRef.current = { x: x, y: y };
        mouseDeltaPositionRef.current = { dx: 0, dy: 0 };
    }, [numPanels, prepareSiblingNodes]);
    var onWrapperTouchStart = React.useCallback(function (e) {
        handleStart(e);
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.addEventListener("touchmove", onWrapperTouchMove, {
            capture: true,
        });
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.addEventListener("touchend", onWrapperTouchEnd, {
            capture: true,
        });
    }, [wrapperNode, handleStart, onWrapperTouchMove, onWrapperTouchEnd]);
    var onWrapperMouseDown = React.useCallback(function (e) {
        handleStart(e);
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.addEventListener("mousemove", onWrapperMouseMove, {
            capture: true,
        });
        wrapperNode === null || wrapperNode === void 0 ? void 0 : wrapperNode.addEventListener("mouseup", onWrapperMouseUp, {
            capture: true,
        });
    }, [wrapperNode, handleStart, onWrapperMouseMove, onWrapperMouseUp]);
    var autoSlideToNextPage = React.useCallback(function () {
        if (numPanels < 2) {
            return;
        }
        var nextPage = (currentPage + 1) % numPanels;
        setCurrentPage(nextPage);
        var shouldMoveBack = numPanels === 2 && currentPage === 1;
        if (shouldMoveBack) {
            switch (axis) {
                case Axis.horizontal:
                    moveTowards(MovementDirection.LEFT);
                    break;
                case Axis.vertical:
                    moveTowards(MovementDirection.UP);
                    break;
            }
            return;
        }
        switch (axis) {
            case Axis.horizontal:
                moveTowards(MovementDirection.RIGHT);
                break;
            case Axis.vertical:
                moveTowards(MovementDirection.DOWN);
                break;
        }
    }, [currentPage, numPanels, axis, moveTowards]);
    React.useEffect(function measureWrapperSize() {
        if (wrapperNode) {
            setWrapperSize(computeSizeOf(wrapperNode));
        }
    }, [wrapperNode]);
    React.useEffect(function generateRefs() {
        setPanelNodeRefs(function (nodes) {
            return Array(numPanels)
                .fill(null)
                .map(function (_, i) { return nodes[i] || React.createRef(); });
        });
    }, [numPanels]);
    React.useEffect(function hidePanels() {
        panelNodeRefs.forEach(function (ref) { return setOpacityOf(ref.current, false); });
    }, [panelNodeRefs]);
    React.useEffect(function initializePanels() {
        prepareSiblingNodes();
    }, [prepareSiblingNodes]);
    React.useEffect(function executePageChangeCallback() {
        if (onPageChanged) {
            onPageChanged(currentPage);
        }
    }, [currentPage, onPageChanged]);
    React.useEffect(function resetAutoSlideTimeout() {
        if (autoSlideTimeoutRef.current) {
            clearTimeout(autoSlideTimeoutRef.current);
        }
        if (auto) {
            autoSlideTimeoutRef.current = setTimeout(autoSlideToNextPage, autoSlideInterval.inMilliseconds());
        }
        return function () {
            if (autoSlideTimeoutRef.current) {
                clearTimeout(autoSlideTimeoutRef.current);
            }
        };
    }, [auto, currentPage, autoSlideInterval, autoSlideToNextPage]);
    if (!loop && auto) {
        throw new Error("auto sliding requires looping of SwipeablePanel");
    }
    return (_jsxs(StyledWrapper, __assign({ ref: function (node) { return setWrapperNode(node); }, onMouseDown: !isMobile ? onWrapperMouseDown : undefined, onTouchStart: isMobile ? onWrapperTouchStart : undefined }, { children: [panels.map(function (panel, index) {
                var showPanel = isAdjacent(index, currentPage, numPanels, loop);
                return showPanel && (_jsx(StyledPanel, __assign({ ref: panelNodeRefs[index] }, { children: panel }), index));
            }),
            widgets === null || widgets === void 0 ? void 0 : widgets.map(function (Widget, index) { return (_jsx(Widget, { length: numPanels, currentPage: currentPage }, "widget-" + index)); })] }), void 0));
};
var templateObject_1, templateObject_2;
