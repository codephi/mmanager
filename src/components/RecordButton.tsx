import React from "react";
import { Record } from "../icons";
import styled, { css } from "styled-components";

const RecordBlink = styled(Record)<{ $active: boolean }>`
  z-index: 1000;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;

  color: white;
  ${(props) =>
    props.$active &&
    css`
      animation: blink-red 1s steps(1, end) infinite;
    `}

  @keyframes blink-red {
    0%,
    100% {
      color: white;
    }
    50% {
      color: red;
    }
  }
`;

interface RecordButtonProps {
  active?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ active = false }) => {
  return <RecordBlink $active={active} />;
};

export default RecordButton;
