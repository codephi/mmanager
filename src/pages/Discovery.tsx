import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSpacesStore } from "../store/spacesStore";
import { useDiscoveryStore } from "../store/discoveryStore";
import { WindowsGrid } from "../components/WindowsGrid";
import { Pinneds } from "../components/Pinneds";

export const Discovery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setActiveSpace = useSpacesStore((s) => s.setActiveSpace);
  const goToDiscoveryPage = useDiscoveryStore((s) => s.goToDiscoveryPage);
  const setDiscoveryLimit = useDiscoveryStore((s) => s.setDiscoveryLimit);
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  
  const initializedRef = useRef(false);
  const updatingUrlRef = useRef(false);

  useEffect(() => {
    // Garante que estamos no space discovery
    setActiveSpace("discovery");
    
    // Carrega discovery quando entra na página
    useDiscoveryStore.getState().loadDiscovery();
  }, [setActiveSpace]);

  // Inicialização única baseada na URL
  useEffect(() => {
    if (initializedRef.current) return;
    
    const offsetParam = searchParams.get("offset");
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

    // Calcula página com base no limit correto
    if (pageParam) {
      targetPage = Math.max(1, parseInt(pageParam, 10));
    } else if (offsetParam) {
      const offset = Math.max(0, parseInt(offsetParam, 10));
      targetPage = Math.floor(offset / targetLimit) + 1;
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
    
    const offset = (currentPage - 1) * discoveryLimit;
    const newParams = new URLSearchParams();
    
    if (offset > 0) {
      newParams.set("offset", offset.toString());
    }
    if (currentPage > 1) {
      newParams.set("page", currentPage.toString());
    }
    if (discoveryLimit !== 6) { // 12 é o padrão
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
      <Pinneds />
      <WindowsGrid />
    </>
  );
};
