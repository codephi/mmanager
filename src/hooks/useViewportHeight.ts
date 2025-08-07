import { useEffect } from 'react';

/**
 * Hook que ajusta a altura da viewport no mobile
 * Para casos onde 100dvh não é suportado
 */
export const useViewportHeight = () => {
  useEffect(() => {
    const setVH = () => {
      // Calcular 1% da altura real da viewport
      const vh = window.innerHeight * 0.01;
      
      // Definir a propriedade CSS customizada
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Adicionar classe para fallback CSS
      if (!CSS.supports('height', '100dvh')) {
        document.body.classList.add('js-vh');
        document.getElementById('root')?.classList.add('js-vh');
      }
    };

    // Definir no carregamento
    setVH();

    // Atualizar quando a tela redimensiona (quando a barra de navegação aparece/desaparece)
    const handleResize = () => {
      setVH();
    };

    // Adicionar listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
};
