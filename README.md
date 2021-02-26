# @inhibitor1217/react-swipeablepanel

![Preview](./res/video.gif)

## Usage

```
$ yarn install @inhibitor1217/react-swipeablepanel
```

## Example

```javascript

import {
  SwipeablePanel,
  SwipeablePanelPageLabel,
  Axis,
} from "@inhibitor1217/react-swipeablepanel";

...

ReactDOM.render(
  <SwipeablePanel
    axis={Axis.horizontal}
    widgets={[SwipeablePanelPageLabel]}>
    {ids.map((id) => (
      <img src={`https://picsum.photos/id/${id}/200`} alt="image" key={id} />
    ))}
  </SwipeablePanel>,
  document.getElementById('swipeable_panel')
);
```
