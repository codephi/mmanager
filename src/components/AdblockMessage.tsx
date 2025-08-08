import styled from "styled-components";

const AdblockContainer = styled.div`
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 1rem;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.5;
    max-width: 400px;
    opacity: 0.9;
    margin: 0;
    margin-bottom: 1rem;
  }
  
  ol {
    font-size: 0.9rem;
    text-align: left;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1.5rem; /* Adiciona padding lateral para os números */
    border-radius: 8px;
    margin: 0; /* Remove margin padrão do ol */
    
    li {
      margin-bottom: 0.5rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

export const AdblockMessage: React.FC = () => {
  return (
    <AdblockContainer>
      <h3>🚫 Ad Blocker Detected</h3>
      <p>
        To continue watching streams, please disable your ad blocker for this site.
      </p>
      <ol>
        <li>Click on your ad blocker icon in your browser</li>
        <li>Disable the blocker for this website</li>
        <li>Refresh the page or wait a few seconds</li>
      </ol>
    </AdblockContainer>
  );
};
