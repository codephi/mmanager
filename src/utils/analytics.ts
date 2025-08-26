// Tipos para o Google Analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters?: Record<string, any>
    ) => void;
  }
}

interface StreamEventData {
  stream_title: string;
  action: string;
}

/**
 * Envia um evento para o Google Analytics
 * @param eventName Nome do evento (ex: 'stream_maximize_click')
 * @param data Dados do evento incluindo stream_title e action
 */
export const trackStreamEvent = (
  eventName: string,
  data: StreamEventData
): void => {
  // Verifica se o gtag está disponível
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      stream_title: data.stream_title,
      action: data.action,
    });
  }
};

/**
 * Track maximize/minimize clicks
 */
export const trackMaximizeClick = (streamTitle: string, isMaximized: boolean) => {
  trackStreamEvent('stream_maximize_click', {
    stream_title: streamTitle,
    action: isMaximized ? 'minimize' : 'maximize',
  });
};

/**
 * Track recording start/stop clicks
 */
export const trackRecordingClick = (streamTitle: string, isRecording: boolean) => {
  trackStreamEvent('stream_record_click', {
    stream_title: streamTitle,
    action: isRecording ? 'stop_recording' : 'start_recording',
  });
};

/**
 * Track volume/mute clicks
 */
export const trackVolumeClick = (streamTitle: string, action: 'mute' | 'unmute' | 'volume_change') => {
  trackStreamEvent('stream_volume_click', {
    stream_title: streamTitle,
    action,
  });
};

/**
 * Track chat link clicks
 */
export const trackChatClick = (streamTitle: string) => {
  trackStreamEvent('stream_chat_click', {
    stream_title: streamTitle,
    action: 'open_chat',
  });
};
