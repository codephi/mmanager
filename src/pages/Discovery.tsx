import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDiscoveryStore } from "../store/discoveryStore";
import { WindowsGrid } from "../components/WindowsGrid";

export const Discovery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = useDiscoveryStore((s) => s.currentPage);
  const discoveryLimit = useDiscoveryStore((s) => s.discoveryLimit);
  
  const initializedRef = useRef(false);
  const updatingUrlRef = useRef(false);

  useEffect(() => {
    // Carrega discovery quando entra na página
    useDiscoveryStore.getState().loadDiscovery();
  }, []);


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
