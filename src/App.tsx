import React from "react";
import { WindowsGrid } from "./components/WindowsGrid";
import Toolbar from "./components/Toolbar";
import styled from "styled-components";
import { AppInitializer } from "./components/AppInitializer";

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
      <AppInitializer />
      <WindowsGrid />
      <Toolbar />
    </Wrappper>
  );
}

export default App;
