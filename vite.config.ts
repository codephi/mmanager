import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem - separa React e componentes relacionados
          'react-vendor': [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          
          // UI Libraries - bibliotecas de interface
          'ui-libs': [
            'styled-components',
            'react-grid-layout',
            'react-rnd',
            'react-resizable'
          ],
          
          // State Management - gerenciamento de estado
          'state-libs': [
            'zustand'
          ],
          
          // Media/Streaming - bibliotecas de mídia e streaming
          'media-libs': [
            'hls.js',
            'streamsaver',
            'itty-router'
          ]
        },
        
        // Configurações adicionais para otimização
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    
    // Ajustar limite de warning para valor realista considerando HLS.js
    chunkSizeWarningLimit: 600, // Ajustado para 600kB para acomodar media-libs chunk
    
    // Otimizações adicionais
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Múltiplas passadas de otimização
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false
      },
      mangle: {
        safari10: true,
        toplevel: true // Minifica nomes de variáveis/funções no top level
      },
      format: {
        comments: false // Remove todos os comentários
      }
    },
    
    // Configurações de sourcemap para produção
    sourcemap: false // Desabilita sourcemaps em produção para reduzir tamanho
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'styled-components',
      'zustand',
      'hls.js'
    ],
    exclude: [
      // Excluir dependências que devem ser carregadas dinamicamente
    ]
  }
});
