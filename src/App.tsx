import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import Toolbar from "./components/Toolbar";
import { Discovery } from "./pages/Discovery";
import { Favorites } from "./pages/Favorites";

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
  return (
    <Wrapper>
      <Routes>
        <Route path="/" element={<Discovery />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
      <Toolbar />
    </Wrapper>
  );
}

export default App;
