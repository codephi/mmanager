import React from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "../icons";

const PaginationContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  color: var(--text-color);
  user-select: none;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};
  background: ${({ $active }) => ($active ? "#ccc" : "transparent")};
`;

const NavButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #fff;
  padding: 6px 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isMobile = false,
}) => {
  const generatePages = () => {
    const pages: (number | string)[] = [];

    // Mobile: página atual, próxima e última
    if (isMobile) {
      if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
      }
      
      // Sempre mostra: página atual
      pages.push(currentPage);
      
      // Se não for a última página, mostra a próxima
      if (currentPage < totalPages) {
        pages.push(currentPage + 1);
      }
      
      // Se a próxima página não é a última, adiciona "..." e a última
      if (currentPage + 1 < totalPages) {
        if (currentPage + 2 < totalPages) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
      
      return pages;
    }

    // Desktop: lógica original
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let middlePages: number[] = [];

    if (currentPage <= 3) {
      middlePages = [2, 3, 4];
    } else if (currentPage >= totalPages - 2) {
      middlePages = [totalPages - 3, totalPages - 2, totalPages - 1];
    } else {
      middlePages = [currentPage - 1, currentPage, currentPage + 1];
    }

    if (middlePages[0] > 2) pages.push("...");
    pages.push(...middlePages);
    if (middlePages[2] < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const pages = generatePages();

  return (
    <PaginationContainer>
      <NavButton
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </NavButton>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`}>...</span>
        ) : (
          <PageButton
            key={p}
            $active={p === currentPage}
            onClick={() => onPageChange(p as number)}
          >
            {p}
          </PageButton>
        )
      )}
      <NavButton
        disabled={currentPage === totalPages}
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </NavButton>
    </PaginationContainer>
  );
};
