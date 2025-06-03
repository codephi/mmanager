import React from "react";
import styled from "styled-components";

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
  background: transparent;
  border: 1px solid #888;
  color: #333;
  font-size: 1.1em;
  padding: 2px 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const generatePages = () => {
    const pages: (number | string)[] = [];

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
        {"<"}
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
        {">"}
      </NavButton>
    </PaginationContainer>
  );
};
