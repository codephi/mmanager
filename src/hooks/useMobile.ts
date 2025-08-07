import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  userAgent: string;
}

// Breakpoints padrão
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export const useMobile = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    // Valores padrão para SSR/hidração
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        touchSupported: false,
        userAgent: '',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent;
    
    // Detecção por largura da tela
    const isMobileByWidth = width < BREAKPOINTS.mobile;
    const isTabletByWidth = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    
    // Detecção por User Agent (mais precisa)
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletRegex = /iPad|Android(?=.*\b(tablet|pad)\b)/i;
    const isMobileByUA = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
    const isTabletByUA = tabletRegex.test(userAgent);
    
    // Combina detecções (prioriza User Agent para precisão)
    const isMobile = isMobileByUA || (isMobileByWidth && !isTabletByUA);
    const isTablet = isTabletByUA || (isTabletByWidth && !isMobileByUA);
    const isDesktop = !isMobile && !isTablet;
    
    // Detecção de suporte a touch
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      touchSupported,
      userAgent,
    };
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      // Detecção por largura da tela
      const isMobileByWidth = width < BREAKPOINTS.mobile;
      const isTabletByWidth = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
      
      // Detecção por User Agent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const tabletRegex = /iPad|Android(?=.*\b(tablet|pad)\b)/i;
      const isMobileByUA = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
      const isTabletByUA = tabletRegex.test(userAgent);
      
      // Combina detecções
      const isMobile = isMobileByUA || (isMobileByWidth && !isTabletByUA);
      const isTablet = isTabletByUA || (isTabletByWidth && !isMobileByUA);
      const isDesktop = !isMobile && !isTablet;
      
      // Detecção de suporte a touch
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported,
        userAgent,
      });
    };

    // Atualiza na inicialização
    updateDetection();

    // Listener para mudanças de tamanho/orientação
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
};

// Hook adicional para breakpoints específicos
export const useBreakpoint = (breakpoint: number): boolean => {
  const { screenWidth } = useMobile();
  return screenWidth >= breakpoint;
};

// Hook para orientação específica
export const useOrientation = (): 'portrait' | 'landscape' => {
  const { orientation } = useMobile();
  return orientation;
};

// Utilitário para classes CSS condicionais
export const getMobileClasses = (detection: MobileDetection) => {
  const classes: string[] = [];
  
  if (detection.isMobile) classes.push('is-mobile');
  if (detection.isTablet) classes.push('is-tablet');
  if (detection.isDesktop) classes.push('is-desktop');
  if (detection.touchSupported) classes.push('touch-supported');
  if (detection.orientation === 'portrait') classes.push('portrait');
  if (detection.orientation === 'landscape') classes.push('landscape');
  
  return classes.join(' ');
};
