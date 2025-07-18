import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, isLoading = false }) => {
  if (totalItems <= 0) {
    return null;
  }
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button 
        onClick={handlePrevious} 
        disabled={currentPage === 1 || isLoading}
        variant="secondary"
        size="sm"
      >
        Anterior
      </Button>
      <span className="text-sm text-slate-600">
        Mostrando {startItem}-{endItem} de {totalItems} resultados
      </span>
      <Button 
        onClick={handleNext} 
        disabled={currentPage === totalPages || isLoading}
        variant="secondary"
        size="sm"
      >
        Siguiente
      </Button>
    </div>
  );
};
