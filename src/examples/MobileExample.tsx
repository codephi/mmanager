import React from 'react';
import styled from 'styled-components';
import { useMobile, useBreakpoint, useOrientation, getMobileClasses } from '../hooks/useMobile';

// Exemplo de styled component responsivo
const ResponsiveContainer = styled.div<{ $isMobile: boolean; $isTablet: boolean }>`
  padding: ${({ $isMobile, $isTablet }) => 
    $isMobile ? '1rem' : $isTablet ? '1.5rem' : '2rem'
  };
  
  display: grid;
  grid-template-columns: ${({ $isMobile }) => 
    $isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'
  };
  gap: ${({ $isMobile }) => $isMobile ? '1rem' : '2rem'};
  
  @media (max-width: 768px) {
    padding: 1rem;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DeviceInfo = styled.div`
  background: var(--primary-color-alpha);
  padding: 1rem;
  border-radius: 8px;
  color: white;
`;

export const MobileExample: React.FC = () => {
  // Hook principal - detecta tudo
  const mobileDetection = useMobile();
  
  // Hooks específicos
  const isLargeScreen = useBreakpoint(1200);
  const orientation = useOrientation();
  
  // Função utilitária para classes CSS
  const cssClasses = getMobileClasses(mobileDetection);

  return (
    <ResponsiveContainer 
      $isMobile={mobileDetection.isMobile} 
      $isTablet={mobileDetection.isTablet}
      className={cssClasses}
    >
      <DeviceInfo>
        <h3>Detecção de Dispositivo</h3>
        <ul>
          <li><strong>Tipo:</strong> {
            mobileDetection.isMobile ? 'Mobile' : 
            mobileDetection.isTablet ? 'Tablet' : 'Desktop'
          }</li>
          <li><strong>Tela:</strong> {mobileDetection.screenWidth}x{mobileDetection.screenHeight}</li>
          <li><strong>Orientação:</strong> {orientation}</li>
          <li><strong>Touch:</strong> {mobileDetection.touchSupported ? 'Sim' : 'Não'}</li>
          <li><strong>Tela Grande:</strong> {isLargeScreen ? 'Sim' : 'Não'}</li>
        </ul>
      </DeviceInfo>

      <DeviceInfo>
        <h3>User Agent</h3>
        <p style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>
          {mobileDetection.userAgent}
        </p>
      </DeviceInfo>

      <DeviceInfo>
        <h3>Classes CSS Aplicadas</h3>
        <p>{cssClasses}</p>
      </DeviceInfo>

      <DeviceInfo>
        <h3>Exemplos de Uso</h3>
        <div>
          {mobileDetection.isMobile && (
            <p>🔥 Layout específico para mobile!</p>
          )}
          {mobileDetection.isTablet && (
            <p>📱 Layout específico para tablet!</p>
          )}
          {mobileDetection.isDesktop && (
            <p>💻 Layout específico para desktop!</p>
          )}
        </div>
      </DeviceInfo>
    </ResponsiveContainer>
  );
};
