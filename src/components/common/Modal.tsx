
import React, { Fragment } from 'react';
import { XIcon } from '@/components/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <XIcon className="w-5 h-5" />
            <span className="sr-only">Cerrar modal</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
