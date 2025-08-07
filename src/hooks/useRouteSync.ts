import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDiscoveryStore } from '../store/discoveryStore';

export const useRouteSync = () => {
  const navigate = useNavigate();
  const { spaceId, pageNumber } = useParams<{ spaceId: string; pageNumber: string }>();
  const currentPage = useDiscoveryStore((s) => s.currentPage);

  // Sincroniza mudanças no store com a URL apenas para discovery
  useEffect(() => {
    if (spaceId === 'discovery' && pageNumber) {
      const urlPage = parseInt(pageNumber, 10);
      if (currentPage !== urlPage && currentPage > 0) {
        navigate(`/discovery/${currentPage}`, { replace: true });
      }
    }
  }, [currentPage, spaceId, pageNumber, navigate]);
};
