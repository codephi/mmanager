import { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(41, 7, 75, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: var(--primary-color);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 3rem 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  color: #fff;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const Warning = styled.p`
  font-size: 0.9rem;
  margin-bottom: 2.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  
  ${({ $primary }) => $primary ? `
    background: rgba(255, 255, 255, 1);
    color: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
    }
  ` : `
    background: var(--element-color);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
  `}
  
  @media (max-width: 768px) {
    padding: 14px 24px;
    min-width: unset;
    width: 100%;
  }
`;

interface AgeGateProps {
  onAccept: () => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com/search?q=Learn+to+program";
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Overlay>
      <Modal>
        <Title>Age Verification Required</Title>
        <Subtitle>
          This website contains adult content and is intended for adults only.
        </Subtitle>
        <Warning>
          By entering this site, you confirm that you are at least 18 years old
          and agree to view adult content.
        </Warning>
        <ButtonContainer>
          <Button $primary onClick={handleAccept}>
            Yes, I'm 18+
          </Button>
          <Button onClick={handleDecline}>
            No, Take me away
          </Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};
