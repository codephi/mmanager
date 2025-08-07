import styled from "styled-components";
import { useMobile } from "../hooks/useMobile";

const SelectWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledSelect = styled.select<{ $isMobile?: boolean }>`
  background: var(--element-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: ${({ $isMobile }) => $isMobile ? '0.8rem' : '0.9rem'};
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  min-width: ${({ $isMobile }) => $isMobile ? '50px' : '60px'};
  text-align: center;
  
  /* Custom dropdown arrow */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  padding-right: ${({ $isMobile }) => $isMobile ? '24px' : '32px'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px var(--element-color);
  }
  
  /* Style options */
  option {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
    padding: 4px 8px;
  }
  
  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 0.8rem;
    min-width: 50px;
    padding-right: 24px;
  }
`;

interface LimitSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  label?: string;
}

export const LimitSelector: React.FC<LimitSelectorProps> = ({
  value,
  onChange,
  options,
}) => {
  const { isMobile } = useMobile();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <SelectWrapper>
      <StyledSelect 
        $isMobile={isMobile}
        value={value} 
        onChange={handleChange}
        title={`Items per page: ${value}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </StyledSelect>
    </SelectWrapper>
  );
};
