import React from "react";
import ReactDOM from "react-dom";
import {
  SwipeablePanel,
  SwipeablePanelPageLabel,
  Axis,
} from "@inhibitor1217/react-swipeablepanel";

const numImages = 5;
const ids = Array(numImages)
  .fill(null)
  .map(() => Math.floor(Math.random() * 200));

const App = () => {
  return (
    <div className="container">
      <h1>Swipable Panel Example</h1>
      <span>Horizontal</span>
      <div style={{ width: 300, height: 300 }}>
        <SwipeablePanel
          axis={Axis.horizontal}
          widgets={[SwipeablePanelPageLabel]}
        >
          {ids.map((id) => (
            <img
              src={`https://picsum.photos/id/${id}/200`}
              alt="image"
              key={id}
            />
          ))}
        </SwipeablePanel>
      </div>
      <span>Vertical</span>
      <div style={{ width: 300, height: 300 }}>
        <SwipeablePanel
          axis={Axis.vertical}
          widgets={[SwipeablePanelPageLabel]}
          auto
          loop
        >
          {ids.map((id) => (
            <img
              src={`https://picsum.photos/id/${id}/200`}
              alt="image"
              key={id}
            />
          ))}
        </SwipeablePanel>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
