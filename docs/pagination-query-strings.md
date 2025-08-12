# Controle de Paginação via Query Strings

## 📋 Resumo das Mudanças

Refatoração completa do sistema de paginação para ser **totalmente controlado por query strings** no `discoveryStore`, removendo a responsabilidade dos componentes de gerenciar manualmente os parâmetros da URL.

## 🔄 O que mudou

### **Antes:**
- Componente `Discovery` gerenciava sincronização entre estado e URL
- Controle manual de query strings no componente
- Lógica distribuída entre componente e store

### **Depois:**
- **100% do controle** concentrado no `discoveryStore`
- Componentes apenas consomem o estado do store
- Sincronização automática bidirecional URL ↔ Store

## 🎯 Query Parameters Suportados

| Parâmetro | Descrição | Valor Padrão |
|-----------|-----------|--------------|
| `page` | Página atual (≥1) | `1` |
| `limit` | Items por página | `6` (mobile) / `12` (desktop) |

### Exemplos de URLs:
```
/                    → page=1, limit=padrão
/?page=3             → page=3, limit=padrão  
/?limit=24           → page=1, limit=24
/?page=2&limit=18    → page=2, limit=18
```

## 🏗️ Arquitetura do Store

### **Funções Utilitárias**
```typescript
// Obtém parâmetro da URL
getQueryParam(param: string): string | null

// Atualiza URL mantendo limites padrão limpos
updateQueryParams(page?: number, limit?: number, replace = true)

// Detecta dispositivo e retorna limite apropriado
getDefaultLimit(): number  // 6 mobile, 12 desktop

// Inicializa valores a partir da URL atual
getInitialValues(): { currentPage, discoveryLimit, discoveryOffset }
```

### **Métodos do Store**

#### `initializeFromQueryParams()`
- Lê URL atual e atualiza estado interno
- Chamado automaticamente no carregamento

#### `updateQueryParams(page?, limit?)`
- Atualiza URL com novos parâmetros
- Remove parâmetros quando são valores padrão
- Mantém URL limpa

#### `setDiscoveryLimit(limit)`
- Altera limite de items por página
- **Reseta para página 1** automaticamente
- Atualiza URL e recarrega dados

#### `goToDiscoveryPage(page)`
- Navega para página específica
- Valida limites (1 ≤ page ≤ totalPages)
- Atualiza URL e carrega dados

#### `setCurrentPage(page)`
- Define página atual sem carregar dados
- Útil para sincronização interna
- Atualiza URL automaticamente

## 🔄 Navegação do Navegador

### **Listener para Back/Forward**
```typescript
window.addEventListener('popstate', handlePopstate)
```

Quando usuário usa botões back/forward do navegador:
1. Store detecta mudança via `popstate`
2. Reinicializa estado a partir da nova URL
3. Recarrega dados automaticamente

## 📱 Detecção Responsiva

### **Limites Baseados em Dispositivo**
- **Mobile** (`width < 768px`): limite máximo 25 items
- **Desktop** (`width ≥ 768px`): limite máximo 50 items
- **Padrões**: 6 (mobile) / 12 (desktop)

### **Inicialização Inteligente**
```typescript
const getInitialValues = () => {
  const defaultLimit = getDefaultLimit();
  const isMobile = window.innerWidth < 768;
  
  // Lê URL e aplica limites baseados no dispositivo
  // ...
}
```

## 🧹 URL Clean

### **Parâmetros Padrão são Removidos**
```
/?page=1&limit=12  →  /          (valores padrão)
/?page=2&limit=12  →  /?page=2   (limite padrão omitido)
/?page=1&limit=24  →  /?limit=24 (página padrão omitida)
```

### **Historia do Navegador**
- Usa `replaceState` por padrão (não cria entradas no histórico)
- Pode usar `pushState` quando necessário
- Mantém botões back/forward funcionais

## 🏛️ Componentes Simplificados

### **Discovery.tsx - Antes:**
```typescript
export const Discovery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  
  const initializedRef = useRef(false);
  const updatingUrlRef = useRef(false);

  // Complexo sistema de sincronização manual
  useEffect(() => {
    // 40+ linhas de lógica de sincronização
  }, [currentPage, discoveryLimit, searchParams]);

  return <WindowsGrid />;
};
```

### **Discovery.tsx - Depois:**
```typescript
export const Discovery = () => {
  useEffect(() => {
    // Store gerencia tudo automaticamente
    useDiscoveryStore.getState().loadDiscovery();
  }, []);

  return <WindowsGrid />;
};
```

## ✅ Vantagens da Implementação

### **🎯 Centralização**
- Todo controle de query strings em um local
- Lógica reutilizável entre componentes
- Manutenção simplificada

### **🔄 Sincronização Automática**
- URL sempre reflete o estado atual
- Estado sempre reflete a URL atual
- Navegação do navegador funciona perfeitamente

### **🧹 URLs Limpas**
- Remove parâmetros padrão desnecessários
- Mantém URLs compartilháveis e legíveis
- SEO-friendly

### **📱 Responsividade**
- Adapta limites automaticamente por dispositivo
- Mantém consistência entre mobile e desktop
- Preserva experiência do usuário

### **🛡️ Robustez**
- Validação de parâmetros integrada
- Tratamento de erros centralizado
- Fallbacks para valores inválidos

## 🧪 Testes Funcionais

### **Cenários Testados:**
1. ✅ Carregamento inicial sem parâmetros
2. ✅ Carregamento com parâmetros válidos
3. ✅ Navegação por páginas via componentes
4. ✅ Mudança de limite via seletor
5. ✅ Navegação back/forward do navegador
6. ✅ URLs com parâmetros inválidos
7. ✅ Responsividade mobile ↔ desktop
8. ✅ Persistência ao recarregar página

### **URLs de Teste:**
```
/?page=5&limit=24
/?page=999          (página inválida)
/?limit=abc         (limite inválido)
/?page=-1&limit=0   (valores negativos)
```

## 🚀 Uso nos Componentes

### **Toolbar.tsx**
```typescript
const goToDiscoveryPage = useDiscoveryStore((s) => s.goToDiscoveryPage);
const setDiscoveryLimit = useDiscoveryStore((s) => s.setDiscoveryLimit);

// Usa diretamente os métodos do store
<Pagination onPageChange={goToDiscoveryPage} />
<LimitSelector onChange={setDiscoveryLimit} />
```

### **Pagination.tsx**
```typescript
// Sem mudanças - continua recebendo onPageChange como prop
const Pagination = ({ onPageChange, currentPage, totalPages }) => {
  return (
    <button onClick={() => onPageChange(5)}>
      Página 5
    </button>
  );
};
```

## 🔮 Benefícios Futuros

1. **Bookmarking**: URLs podem ser salvos e compartilhados
2. **SEO**: URLs estruturadas para motores de busca
3. **Analytics**: Tracking de navegação simplificado  
4. **Deep Linking**: Link direto para qualquer estado
5. **Server-side Rendering**: Suporte futuro para SSR

---

Esta implementação torna o sistema de paginação mais **robusto**, **maintível** e **centrado no usuário**, seguindo as melhores práticas de desenvolvimento web moderno. 🎉
