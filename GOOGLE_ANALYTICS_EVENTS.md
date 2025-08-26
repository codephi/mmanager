# Google Analytics Events - Documentação

## Eventos Implementados

Esta implementação adiciona rastreamento de eventos do Google Analytics para interações importantes do usuário com os streams.

### 1. **stream_maximize_click**
- **Dispara quando:** O usuário clica no botão de maximizar/minimizar
- **Parâmetros:**
  - `stream_title`: Nome do stream/sala
  - `action`: `"maximize"` ou `"minimize"`

### 2. **stream_record_click**
- **Dispara quando:** O usuário clica no botão de gravar
- **Parâmetros:**
  - `stream_title`: Nome do stream/sala
  - `action`: `"start_recording"` ou `"stop_recording"`

### 3. **stream_volume_click**
- **Dispara quando:** O usuário clica no botão de mute/unmute
- **Parâmetros:**
  - `stream_title`: Nome do stream/sala
  - `action`: `"mute"` ou `"unmute"`

### 4. **stream_chat_click**
- **Dispara quando:** O usuário clica no link "Open live chat"
- **Parâmetros:**
  - `stream_title`: Nome do stream/sala
  - `action`: `"open_chat"`

## Estrutura da Implementação

### Arquivo de Utilidades (`src/utils/analytics.ts`)
Contém funções auxiliares para enviar eventos ao Google Analytics:
- `trackStreamEvent()`: Função genérica para enviar eventos
- `trackMaximizeClick()`: Para eventos de maximizar/minimizar
- `trackRecordingClick()`: Para eventos de gravação
- `trackVolumeClick()`: Para eventos de volume/mute
- `trackChatClick()`: Para eventos de chat

### Componentes Modificados
1. **WindowContainer.tsx**: Integra eventos de maximizar, gravar e chat
2. **VolumeControl.tsx**: Integra eventos de mute/unmute

## Como Testar

### 1. Usando o Console do Navegador
Abra o console do navegador (F12) e execute:
```javascript
// Verificar se o gtag está disponível
console.log(typeof window.gtag);

// Monitorar eventos (adicione isso antes de interagir)
window.gtag = new Proxy(window.gtag, {
  apply: function(target, thisArg, argumentsList) {
    console.log('GA Event:', argumentsList);
    return target.apply(thisArg, argumentsList);
  }
});
```

### 2. Usando a Extensão Google Analytics Debugger
1. Instale a extensão [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Ative a extensão
3. Abra o console do navegador
4. Interaja com os botões e observe os eventos sendo registrados

### 3. No Google Analytics Real-Time
1. Acesse o [Google Analytics](https://analytics.google.com)
2. Navegue para **Relatórios em tempo real** > **Eventos**
3. Interaja com a aplicação e veja os eventos aparecendo em tempo real

## Formato dos Eventos no GA

Exemplo de como os eventos aparecem no Google Analytics:

```javascript
window.gtag('event', 'stream_maximize_click', {
  stream_title: 'example_room',
  action: 'maximize'
});
```

## Notas Importantes

- Os eventos só são enviados se `window.gtag` estiver disponível
- Em ambiente de desenvolvimento local, certifique-se de que o Google Analytics está carregado
- O ID do Google Analytics configurado é: `G-TM77LM7RVL`
- Todos os eventos incluem o nome do stream para permitir análises específicas por sala
