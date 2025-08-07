import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import Toolbar from "./components/Toolbar";
import { Discovery } from "./pages/Discovery";
import { Favorites } from "./pages/Favorites";
import { AppInitializer } from "./components/AppInitializer";
import { useViewportHeight } from "./hooks/useViewportHeight";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height - ajusta conforme a UI do navegador */
  background: var(--dark-color);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: space-between;
  
  /* Fallback para navegadores que não suportam dvh */
  @supports not (height: 100dvh) {
    &.js-vh {
      height: calc(var(--vh, 1vh) * 100);
    }
  }
`;

function App() {
  // Hook para ajustar viewport height no mobile
  useViewportHeight();
  
  return (
    <Wrapper>
      <AppInitializer />
      <Routes>
        <Route path="/" element={<Discovery />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
      <Toolbar />
    </Wrapper>
  );
}

export default App;
