import { WindowsGrid } from "./components/WindowsGrid";
import Toolbar from "./components/Toolbar";
import styled from "styled-components";
import { useSpacesStorageSync } from "./hooks/useSpacesStorageSync";
import { Pinneds } from "./components/Pinneds";
import { AppInitializer } from "./components/AppInitializer";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: var(--dark-color);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: space-between;
`;

function App() {
  useSpacesStorageSync();

  return (
    <Wrapper>
      <AppInitializer />
      <Pinneds />
      <WindowsGrid />
      <Toolbar />
    </Wrapper>
  );
}

export default App;
