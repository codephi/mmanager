# Hook useMobile

O `useMobile` é um hook React customizado para detectar dispositivos móveis e adaptar a interface do usuário de forma responsiva.

## 🚀 Funcionalidades

- ✅ **Detecção precisa**: Combina largura da tela e User Agent para máxima precisão
- ✅ **Detecção em tempo real**: Atualiza automaticamente com mudanças de orientação/tamanho
- ✅ **TypeScript**: Totalmente tipado
- ✅ **SSR-ready**: Funciona com renderização server-side
- ✅ **Performance otimizada**: Debounce automático e cleanup adequado
- ✅ **Múltiplos breakpoints**: Mobile, Tablet e Desktop
- ✅ **Detecção de touch**: Identifica dispositivos com suporte a toque
- ✅ **Orientação**: Detecta portrait/landscape em tempo real

## 📦 Instalação

O hook já está incluído no projeto em `src/hooks/useMobile.ts`.

## 🎯 Uso Básico

```tsx
import { useMobile } from '../hooks/useMobile';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop } = useMobile();

  return (
    <div>
      {isMobile && <p>Layout Mobile</p>}
      {isTablet && <p>Layout Tablet</p>}
      {isDesktop && <p>Layout Desktop</p>}
    </div>
  );
};
```

## 🎨 Styled Components

```tsx
import styled from 'styled-components';
import { useMobile } from '../hooks/useMobile';

const ResponsiveContainer = styled.div<{ $isMobile: boolean }>`
  padding: ${({ $isMobile }) => $isMobile ? '1rem' : '2rem'};
  flex-direction: ${({ $isMobile }) => $isMobile ? 'column' : 'row'};
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
  }
`;

const MyComponent = () => {
  const { isMobile } = useMobile();

  return (
    <ResponsiveContainer $isMobile={isMobile}>
      <p>Conteúdo responsivo</p>
    </ResponsiveContainer>
  );
};
```

## 🔧 API Completa

### useMobile()

Retorna um objeto `MobileDetection` com as seguintes propriedades:

```typescript
interface MobileDetection {
  isMobile: boolean;        // Dispositivo móvel
  isTablet: boolean;        // Tablet
  isDesktop: boolean;       // Desktop
  screenWidth: number;      // Largura da tela
  screenHeight: number;     // Altura da tela
  orientation: 'portrait' | 'landscape';  // Orientação
  touchSupported: boolean;  // Suporte a toque
  userAgent: string;        // String do User Agent
}
```

### useBreakpoint(breakpoint: number)

Hook para breakpoints específicos:

```tsx
const isLargeScreen = useBreakpoint(1200);
const isMediumScreen = useBreakpoint(992);
```

### useOrientation()

Hook específico para orientação:

```tsx
const orientation = useOrientation(); // 'portrait' | 'landscape'
```

### getMobileClasses(detection: MobileDetection)

Utilitário para classes CSS:

```tsx
const cssClasses = getMobileClasses(detection);
// Retorna: "is-mobile touch-supported portrait"
```

## 📱 Breakpoints Padrão

```typescript
const BREAKPOINTS = {
  mobile: 768,   // < 768px = mobile
  tablet: 1024,  // 768px - 1024px = tablet
} as const;      // > 1024px = desktop
```

## 🎯 Exemplos Práticos

### 1. Modal Responsivo

```tsx
const Modal = styled.div<{ $isMobile: boolean }>`
  position: ${({ $isMobile }) => $isMobile ? 'fixed' : 'absolute'};
  ${({ $isMobile }) => $isMobile ? `
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    height: 80vh;
  ` : `
    top: 100%;
    right: 0;
    width: 350px;
  `}
`;
```

### 2. Navegação Adaptativa

```tsx
const Navigation = () => {
  const { isMobile, isTablet } = useMobile();
  
  if (isMobile) {
    return <MobileMenu />;
  }
  
  if (isTablet) {
    return <TabletMenu />;
  }
  
  return <DesktopMenu />;
};
```

### 3. Layout Condicional

```tsx
const Layout = () => {
  const { isMobile, orientation } = useMobile();
  
  return (
    <Container>
      {!isMobile && <Sidebar />}
      <MainContent $fullWidth={isMobile} />
      {isMobile && orientation === 'portrait' && <MobileFooter />}
    </Container>
  );
};
```

## ⚡ Performance

- **Debounce automático**: Evita re-renders excessivos
- **Event listeners otimizados**: Cleanup automático
- **Memoização**: Cálculos são cacheados
- **SSR safe**: Valores padrão para servidor

## 🎨 Classes CSS Geradas

O utilitário `getMobileClasses` gera classes que podem ser usadas no CSS:

```css
.is-mobile { /* Estilos mobile */ }
.is-tablet { /* Estilos tablet */ }
.is-desktop { /* Estilos desktop */ }
.touch-supported { /* Dispositivos touch */ }
.portrait { /* Orientação retrato */ }
.landscape { /* Orientação paisagem */ }
```

## 📝 Notas Importantes

1. **User Agent**: Usado para detecção precisa, mas pode ser alterado
2. **Breakpoints**: Personalizáveis conforme necessidade
3. **Orientação**: Atualizada em tempo real com eventos
4. **Touch**: Detecta capacidade, não uso atual
5. **SSR**: Valores padrão desktop para hidratação

## 🔗 Componentes que Usam

- `Toolbar.tsx`: Layout responsivo da barra de ferramentas
- `DownloadMonitor.tsx`: Modal adaptativo para mobile
- Outros componentes podem ser facilmente adaptados

Este hook fornece uma base sólida para criar interfaces verdadeiramente responsivas e adaptadas para cada tipo de dispositivo! 📱💻🖥️
