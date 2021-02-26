import React from "react";
import styled from "styled-components";

interface PageLabelProps {
  key: string;
  length: number;
  currentPage: number;
}

const StyledPageLabel = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;

  padding: 0 4px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 2px;

  span {
    font-size: 12px;
    color: #ffffff;
  }
`;

export const SwipeablePanelPageLabel: React.FC<PageLabelProps> = ({
  key,
  length,
  currentPage,
}) => {
  return (
    <StyledPageLabel key={key}>
      <span>
        {currentPage + 1}/{length}
      </span>
    </StyledPageLabel>
  );
};
