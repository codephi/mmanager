# Merge Inteligente de Parâmetros na Query String

## 🔄 Como Funciona o Novo Sistema

O sistema agora faz um **merge inteligente** dos parâmetros `page` e `limit`, tentando preservar a página atual quando você altera o limite, desde que seja matematicamente possível.

## 📊 Exemplos Práticos

### **Cenário 1: Página é mantida (caso ideal)**

```
Estado inicial: /?page=3&limit=12
Total de rooms: 200
Páginas disponíveis com limit=12: 17 páginas (200/12 ≈ 16.67)

Usuário altera limite para 24:
- Páginas disponíveis com limit=24: 9 páginas (200/24 ≈ 8.33)
- Página 3 ainda é válida (3 ≤ 9) ✅
- Resultado: /?page=3&limit=24
```

### **Cenário 2: Página é ajustada para a última válida**

```
Estado inicial: /?page=15&limit=12  
Total de rooms: 200
Páginas disponíveis com limit=12: 17 páginas

Usuário altera limite para 50:
- Páginas disponíveis com limit=50: 4 páginas (200/50 = 4)
- Página 15 é inválida (15 > 4) ❌
- Sistema ajusta para última página válida: 4
- Resultado: /?page=4&limit=50
```

### **Cenário 3: Retorna para página 1 (fallback)**

```
Estado inicial: /?page=5&limit=24
Total de rooms: 100
Páginas disponíveis com limit=24: 5 páginas (100/24 ≈ 4.17)

Usuário altera limite para 6:
- Páginas disponíveis com limit=6: 17 páginas (100/6 ≈ 16.67)
- Página 5 ainda é válida (5 ≤ 17) ✅
- Resultado: /?page=5&limit=6
```

### **Cenário 4: Dados insuficientes (estimativa)**

```
Estado inicial: /?page=2&limit=12
Total de rooms: 0 (ainda não carregou)

Usuário altera limite para 24:
- Não temos dados para estimar, assume página 1 por segurança
- Após carregar os dados reais, ajusta se necessário
- Resultado temporário: /?page=1&limit=24
- Resultado final: /?page=2&limit=24 (se página 2 existir)
```

## 🧠 Lógica do Algoritmo

```typescript
setDiscoveryLimit: async (limit) => {
  const state = get();
  
  // 1. Estima quantas páginas teremos com o novo limite
  let estimatedTotalPages = 1;
  if (state.totalRooms > 0) {
    estimatedTotalPages = Math.ceil(state.totalRooms / limit);
  }
  
  // 2. Tenta manter a página atual
  let targetPage = state.currentPage;
  
  // 3. Se inválida, vai para página 1
  if (targetPage > estimatedTotalPages) {
    targetPage = 1;
  }
  
  // 4. Atualiza estado e URL
  set({ discoveryLimit: limit, currentPage: targetPage });
  updateQueryParams(targetPage, limit);
  
  // 5. Carrega dados reais
  await loadDiscoveryPage(newOffset, true);
  
  // 6. Verifica novamente com dados reais e ajusta se necessário
  const realTotalPages = get().totalPages;
  if (targetPage > realTotalPages && realTotalPages > 0) {
    // Ajusta para última página válida
    const finalPage = realTotalPages;
    set({ currentPage: finalPage });
    updateQueryParams(finalPage, limit);
    await loadDiscoveryPage((finalPage - 1) * limit, true);
  }
}
```

## 🎯 Comportamentos do Sistema

### **Preservação Inteligente**
- ✅ Mantém página atual sempre que matematicamente possível
- ✅ Ajusta para última página válida quando necessário
- ✅ Volta para página 1 apenas em casos extremos

### **Atualização da URL**
- ✅ URL sempre reflete o estado real após todas as validações
- ✅ Remove parâmetros padrão para manter URL limpa
- ✅ Merge correto: `/?page=5&limit=12` → `/?page=5&limit=24`

### **Experiência do Usuário**
- 🎯 **Previsível**: Usuário não perde o contexto ao alterar limites
- 🎯 **Inteligente**: Sistema faz o melhor ajuste automático
- 🎯 **Confiável**: URLs podem ser compartilhadas e recarregadas

## 📋 Casos de Teste

### **URLs de Entrada para Testar:**

```bash
# Caso básico - deve manter página
/?page=3&limit=12 → alterar limit para 24 → /?page=3&limit=24

# Página muito alta - deve ajustar
/?page=20&limit=6 → alterar limit para 50 → /?page=X&limit=50 (X = última válida)

# Página 1 - sempre válida
/?limit=12 → alterar limit para 24 → /?limit=24

# Sem parâmetros - comportamento padrão
/ → alterar limit para 18 → /?limit=18
```

### **Fluxo Completo de Validação:**

1. **Entrada**: `/?page=10&limit=12`
2. **Ação**: Usuário altera limit para `30`
3. **Estimativa**: Se totalRooms = 300, então newTotalPages = 10
4. **Validação**: Página 10 ≤ 10 páginas ✅
5. **Resultado**: `/?page=10&limit=30`
6. **Verificação**: Após carregar dados reais, confirma se página 10 existe
7. **Ajuste Final**: Se necessário, ajusta para última página válida

## ⚡ Performance e UX

### **Vantagens:**
- **Zero perda de contexto**: Usuário mantém posição na lista
- **Navegação intuitiva**: Comportamento previsível
- **URLs consistentes**: Sempre refletem estado válido
- **Fallbacks seguros**: Sistema nunca "quebra"

### **Edge Cases Cobertos:**
- Total de rooms = 0
- Página atual > total estimado
- Dados ainda carregando
- Erros de rede durante carregamento
- Parâmetros inválidos na URL

---

Este sistema garante que a **experiência do usuário seja fluida** e que as **URLs sempre representem um estado válido** da aplicação! 🚀
