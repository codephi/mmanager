import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDiscoveryStore } from "../store/discoveryStore";
import { WindowsGrid } from "../components/WindowsGrid";

export const Discovery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const goToDiscoveryPage = useDiscoveryStore((s) => s.goToDiscoveryPage);
  const setDiscoveryLimit = useDiscoveryStore((s) => s.setDiscoveryLimit);
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  
  const initializedRef = useRef(false);
  const updatingUrlRef = useRef(false);

  useEffect(() => {
    // Carrega discovery quando entra na página
    useDiscoveryStore.getState().loadDiscovery();
  }, []);

  // Inicialização única baseada na URL
  useEffect(() => {
    if (initializedRef.current) return;
    
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    let targetPage = 1;
    let targetLimit = 12; // padrão

    // Processa limit primeiro
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if ([6, 12, 24].includes(limit)) {
        targetLimit = limit;
      }
    }

    // Processa página
    if (pageParam) {
      targetPage = Math.max(1, parseInt(pageParam, 10));
    }


    // Bloqueia atualizacoes de URL durante inicializacao
    updatingUrlRef.current = true;
    
    // Atualiza limit se necessário
    if (targetLimit !== discoveryLimit) {
      setDiscoveryLimit(targetLimit);
    }

    // Atualiza página se necessário
    if (targetPage !== currentPage) {
      goToDiscoveryPage(targetPage);
    }
    
    initializedRef.current = true;
    
    // Permite atualizacoes de URL apos inicializacao
    setTimeout(() => {
      updatingUrlRef.current = false;
    }, 500);
  }, []); // Executar apenas na montagem do componente

  // Sincronização Estado → URL (após inicialização)
  useEffect(() => {
    if (!initializedRef.current || updatingUrlRef.current) return;
    
    const newParams = new URLSearchParams();
    
    // Só adiciona page se for diferente de 1
    if (currentPage > 1) {
      newParams.set("page", currentPage.toString());
    }
    
    // Só adiciona limit se for diferente do padrão (12)
    if (discoveryLimit !== 12) {
      newParams.set("limit", discoveryLimit.toString());
    }

    const newUrlState = newParams.toString();
    const currentUrlState = searchParams.toString();
    
    if (newUrlState !== currentUrlState) {
      setSearchParams(newParams, { replace: true });
    }
  }, [currentPage, discoveryLimit, setSearchParams, searchParams]);

  return (
    <>
      <WindowsGrid />
    </>
  );
};
