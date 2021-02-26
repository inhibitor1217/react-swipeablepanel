import React from "react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";
import { Axis } from "../types/axis";
import { Duration } from "../utils/duration";

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

type DeltaPosition = {
  dx: number;
  dy: number;
};

enum MovementDirection {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

const PAGE_MOVE_THRESHOLD = 0.2;

function computeSizeOf(node: HTMLElement): Size {
  const { width: widthPx, height: heightPx } = window.getComputedStyle(node);
  return {
    width: parseFloat(widthPx.split("px")[0]),
    height: parseFloat(heightPx.split("px")[0]),
  };
}

function setOpacityOf(node: HTMLElement | null, isOpaque: boolean): void {
  if (!node) {
    return;
  }

  node.style.opacity = isOpaque ? "1" : "0";
}

function updatePositionOf(
  node: HTMLElement | null,
  position: Position,
  animationDuration: Duration = Duration.ZERO
): void {
  if (!node) {
    return;
  }

  node.style.transitionDuration = `${animationDuration.inMilliseconds()}ms`;
  node.style.transform = `translate(${position.x}px, ${position.y}px)`;
}

function extractPositionFrom(
  e:
    | React.MouseEvent<HTMLDivElement>
    | React.TouchEvent<HTMLDivElement>
    | MouseEvent
    | TouchEvent
): Position {
  switch (e.type) {
    case "touchstart":
    case "touchmove":
    case "touchend": {
      const {
        pageX,
        pageY,
      } = (e as React.TouchEvent<HTMLDivElement>).touches[0];
      return {
        x: pageX,
        y: pageY,
      };
    }
    case "mousedown":
    case "mousemove":
    case "mouseup": {
      const { pageX, pageY } = e as React.MouseEvent<HTMLDivElement>;
      return {
        x: pageX,
        y: pageY,
      };
    }
    default:
      throw new Error(`unsupported event type: ${e.type}`);
  }
}

function determinePage(
  delta: DeltaPosition,
  frameSize: Size,
  state: {
    axis: Axis;
    loop: boolean;
    currentPage: number;
    numPages: number;
  }
): { newPage: number; direction: MovementDirection | null } {
  const { dx, dy } = delta;
  const { width, height } = frameSize;
  const { axis, loop, currentPage, numPages } = state;

  switch (axis) {
    case Axis.horizontal: {
      const isOverThreshold = Math.abs(dx / width) >= PAGE_MOVE_THRESHOLD;
      if (!isOverThreshold) {
        return { newPage: currentPage, direction: null };
      }

      if (dx < 0) {
        const hasNextPage = currentPage < numPages - 1;
        return loop || hasNextPage
          ? {
              newPage: (currentPage + 1) % numPages,
              direction: MovementDirection.RIGHT,
            }
          : {
              newPage: currentPage,
              direction: null,
            };
      } else {
        const hasPreviousPage = currentPage > 0;
        return loop || hasPreviousPage
          ? {
              newPage: (currentPage + numPages - 1) % numPages,
              direction: MovementDirection.LEFT,
            }
          : {
              newPage: currentPage,
              direction: null,
            };
      }
    }
    case Axis.vertical: {
      const isOverThreshold = Math.abs(dy / height) >= PAGE_MOVE_THRESHOLD;
      if (!isOverThreshold) {
        return { newPage: currentPage, direction: null };
      }

      if (dy < 0) {
        const hasNextPage = currentPage < numPages - 1;
        return loop || hasNextPage
          ? {
              newPage: (currentPage + 1) % numPages,
              direction: MovementDirection.DOWN,
            }
          : {
              newPage: currentPage,
              direction: null,
            };
      } else {
        const hasPreviousPage = currentPage > 0;
        return loop || hasPreviousPage
          ? {
              newPage: (currentPage + numPages - 1) % numPages,
              direction: MovementDirection.UP,
            }
          : {
              newPage: currentPage,
              direction: null,
            };
      }
    }
    default:
      return { newPage: currentPage, direction: null };
  }
}

function asymptoticValue(x: number, halfWhen: number, maxValue: number) {
  return maxValue * (Math.atan(x / halfWhen) / (0.5 * Math.PI));
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const StyledPanel = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  transition-property: transform;
  transition-timing-function: ease;
`;

interface SwipeablePanelHelperComponentProps {
  key: string;
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

export const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  loop = false,
  auto = false,
  autoSlideInterval = Duration.from({ seconds: 5 }),
  animationDuration = Duration.from({ milliseconds: 500 }),
  axis,
  children,
  widgets,
  initialPage = 0,
  onPageChanged,
}) => {
  const [currentPage, setCurrentPage] = React.useState<number>(initialPage);
  const panels = React.Children.toArray(children) ?? [];
  const numPanels = panels.length;
  const [wrapperNode, setWrapperNode] = React.useState<HTMLDivElement | null>(
    null
  );
  const [wrapperSize, setWrapperSize] = React.useState<Size | null>(null);
  const [panelNodeRefs, setPanelNodeRefs] = React.useState<
    React.RefObject<HTMLDivElement>[]
  >([]);

  const mousePositionRef = React.useRef<Position | null>(null);
  const mouseDeltaPositionRef = React.useRef<DeltaPosition | null>(null);

  const autoSlideTimeoutRef = React.useRef<number | null>(null);

  const getSiblingNodes = React.useCallback(() => {
    const nextPage = (currentPage + 1) % numPanels;
    const previousPage = (currentPage + numPanels - 1) % numPanels;

    const hasNext = loop || currentPage + 1 < numPanels;
    const hasPrevious = loop || currentPage > 0;

    return {
      current: panelNodeRefs[currentPage]?.current ?? null,
      next: hasNext ? panelNodeRefs[nextPage]?.current : null,
      previous: hasPrevious ? panelNodeRefs[previousPage]?.current : null,
    };
  }, [panelNodeRefs, currentPage, numPanels, loop]);

  const prepareSiblingNodes = React.useCallback(() => {
    if (!wrapperSize) {
      return;
    }

    const { current, next, previous } = getSiblingNodes();
    const { width: wrapperWidth, height: wrapperHeight } = wrapperSize;

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

  const handleHorizontalSwipe = React.useCallback(
    (delta: DeltaPosition, e: Event) => {
      if (!wrapperSize) {
        throw new Error(`size of wrapper node not available`);
      }

      const shouldSwipe =
        axis === Axis.horizontal && Math.abs(delta.dx) > Math.abs(delta.dy);

      if (!shouldSwipe) {
        return;
      }

      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();

      const { dx } = delta;
      const { width } = wrapperSize;

      const isMovingRight = dx < 0;
      const isOverflow = isMovingRight
        ? currentPage === numPanels - 1
        : currentPage === 0;
      const offset = isOverflow
        ? asymptoticValue(dx, 0.2 * width, 0.4 * width)
        : dx;

      const { current, previous, next } = getSiblingNodes();

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
    },
    [axis, currentPage, numPanels, wrapperSize, getSiblingNodes]
  );

  const handleVerticalSwipe = React.useCallback(
    (delta: DeltaPosition, e: Event) => {
      if (!wrapperSize) {
        throw new Error(`size of wrapper node not available`);
      }

      const shouldSwipe =
        axis === Axis.vertical && Math.abs(delta.dy) > Math.abs(delta.dx);

      if (!shouldSwipe) {
        return;
      }

      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();

      const { dy } = delta;
      const { height } = wrapperSize;

      const isMovingUp = dy < 0;
      const isOverflow = isMovingUp
        ? currentPage === numPanels - 1
        : currentPage === 0;
      const offset = isOverflow
        ? asymptoticValue(dy, 0.2 * height, 0.4 * height)
        : dy;

      const { current, previous, next } = getSiblingNodes();

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
    },
    [axis, wrapperSize, getSiblingNodes]
  );

  const handleMove = React.useCallback(
    (position: Position, e: Event) => {
      if (numPanels < 2) {
        return;
      }

      if (!mousePositionRef.current) {
        throw new Error("start position not available: invalid state");
      }

      const { x, y } = position;
      const { x: startX, y: startY } = mousePositionRef.current;
      const dx = x - startX;
      const dy = y - startY;
      mouseDeltaPositionRef.current = { dx, dy };

      handleHorizontalSwipe({ dx, dy }, e);
      handleVerticalSwipe({ dx, dy }, e);
    },
    [axis, handleHorizontalSwipe, handleVerticalSwipe]
  );

  const onWrapperTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        return;
      }

      handleMove(extractPositionFrom(e), e);
    },
    [handleMove]
  );

  const onWrapperMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!mousePositionRef.current) {
        throw new Error("start position not available: invalid state");
      }

      handleMove(extractPositionFrom(e), e);
    },
    [handleMove]
  );

  const moveTowards = React.useCallback(
    (direction: MovementDirection | null) => {
      if (!wrapperSize) {
        throw new Error(`size of wrapper node not available`);
      }

      const { width, height } = wrapperSize;
      const { current, next, previous } = getSiblingNodes();

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
      } else {
        updatePositionOf(current, { x: 0, y: 0 }, animationDuration);
        switch (axis) {
          case Axis.horizontal:
            updatePositionOf(next, { x: width, y: 0 }, animationDuration);
            updatePositionOf(previous, { x: -width, y: 0 }, animationDuration);
            break;
          case Axis.vertical:
            updatePositionOf(next, { x: 0, y: height }, animationDuration);
            updatePositionOf(previous, { x: 0, y: -height }, animationDuration);
        }
      }
    },
    [axis, wrapperSize, getSiblingNodes]
  );

  const handleEnd = React.useCallback(() => {
    if (numPanels < 2) {
      return;
    }

    if (!mouseDeltaPositionRef.current) {
      throw new Error("delta position not available: invalid state");
    }

    if (!wrapperSize) {
      throw new Error(`size of wrapper node not available`);
    }

    const delta = mouseDeltaPositionRef.current;
    const { newPage, direction } = determinePage(delta, wrapperSize, {
      axis,
      loop,
      currentPage,
      numPages: numPanels,
    });

    setCurrentPage(newPage);
    moveTowards(direction);
  }, [axis, loop, currentPage, numPanels, wrapperSize]);

  const onWrapperTouchEnd = React.useCallback(() => {
    handleEnd();

    wrapperNode?.removeEventListener("touchmove", onWrapperTouchMove, {
      capture: true,
    });
    wrapperNode?.removeEventListener("touchend", onWrapperTouchEnd, {
      capture: true,
    });
  }, [wrapperNode, onWrapperTouchMove, handleEnd]);

  const onWrapperMouseUp = React.useCallback(() => {
    handleEnd();

    wrapperNode?.removeEventListener("mousemove", onWrapperMouseMove, {
      capture: true,
    });
    wrapperNode?.removeEventListener("mouseup", onWrapperMouseUp, {
      capture: true,
    });
  }, [wrapperNode, onWrapperMouseMove, handleEnd]);

  const handleStart = React.useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (numPanels < 2) {
        return;
      }

      prepareSiblingNodes();

      const { x, y } = extractPositionFrom(e);
      mousePositionRef.current = { x, y };
      mouseDeltaPositionRef.current = { dx: 0, dy: 0 };
    },
    [numPanels, prepareSiblingNodes]
  );

  const onWrapperTouchStart = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      handleStart(e);
      wrapperNode?.addEventListener("touchmove", onWrapperTouchMove, {
        capture: true,
      });
      wrapperNode?.addEventListener("touchend", onWrapperTouchEnd, {
        capture: true,
      });
    },
    [wrapperNode, handleStart, onWrapperTouchMove, onWrapperTouchEnd]
  );

  const onWrapperMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleStart(e);
      wrapperNode?.addEventListener("mousemove", onWrapperMouseMove, {
        capture: true,
      });
      wrapperNode?.addEventListener("mouseup", onWrapperMouseUp, {
        capture: true,
      });
    },
    [wrapperNode, handleStart, onWrapperMouseMove, onWrapperMouseUp]
  );

  const autoSlideToNextPage = React.useCallback(() => {
    if (numPanels < 2) {
      return;
    }

    const nextPage = (currentPage + 1) % numPanels;
    setCurrentPage(nextPage);

    const shouldMoveBack = numPanels === 2 && currentPage === 1;
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

  React.useEffect(
    function measureWrapperSize() {
      if (wrapperNode) {
        setWrapperSize(computeSizeOf(wrapperNode));
      }
    },
    [wrapperNode]
  );

  React.useEffect(
    function generateRefs() {
      setPanelNodeRefs((nodes) =>
        Array(numPanels)
          .fill(null)
          .map((_, i) => nodes[i] || React.createRef())
      );
    },
    [numPanels]
  );

  React.useEffect(
    function hidePanels() {
      panelNodeRefs.forEach((ref) => setOpacityOf(ref.current, false));
    },
    [panelNodeRefs]
  );

  React.useEffect(
    function initializePanels() {
      prepareSiblingNodes();
    },
    [prepareSiblingNodes]
  );

  React.useEffect(
    function executePageChangeCallback() {
      if (onPageChanged) {
        onPageChanged(currentPage);
      }
    },
    [currentPage, onPageChanged]
  );

  React.useEffect(
    function resetAutoSlideTimeout() {
      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current);
      }

      if (auto) {
        autoSlideTimeoutRef.current = setTimeout(
          autoSlideToNextPage,
          autoSlideInterval.inMilliseconds()
        );
      }

      return () => {
        if (autoSlideTimeoutRef.current) {
          clearTimeout(autoSlideTimeoutRef.current);
        }
      };
    },
    [auto, currentPage, autoSlideInterval, autoSlideToNextPage]
  );

  if (!loop && auto) {
    throw new Error("auto sliding requires looping of SwipeablePanel");
  }

  return (
    <StyledWrapper
      ref={(node) => setWrapperNode(node)}
      onMouseDown={!isMobile ? onWrapperMouseDown : undefined}
      onTouchStart={isMobile ? onWrapperTouchStart : undefined}
    >
      {panels.map((panel, index) => (
        <StyledPanel key={index} ref={panelNodeRefs[index]}>
          {panel}
        </StyledPanel>
      ))}
      {widgets?.map((Widget, index) => (
        <Widget
          key={`widget-${index}`}
          length={numPanels}
          currentPage={currentPage}
        />
      ))}
    </StyledWrapper>
  );
};
