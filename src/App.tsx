import { WindowsGrid } from "./components/WindowsGrid";
import Toolbar from "./components/Toolbar";
import styled from "styled-components";
import { useSpacesStorageSync } from "./hooks/useSpacesStorageSync";
import { Pinneds } from "./components/Pinneds";

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
      <Pinneds />
      <WindowsGrid />
      <Toolbar />
    </Wrapper>
  );
}

export default App;
