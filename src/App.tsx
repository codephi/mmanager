import React from "react";
import "./App.css";
import { WindowsGrid } from "./components/WindowsGrid";
import Toolbar from "./components/Toolbar";
import styled from "styled-components";

const Wrappper = styled.div`
  width: 100vw;
  height: 100vh;
  background: var(--dark-color);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function App() {
  return (
    <Wrappper>
      <WindowsGrid />
      <Toolbar />
    </Wrappper>
  );
}

export default App;
