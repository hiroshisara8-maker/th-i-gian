import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Xóa nội dung',
  itemName,
  message,
  confirmText,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-bold text-stone-800 text-base sm:text-lg">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {message || (
                <>
                  Bạn có chắc chắn muốn xóa {itemName ? <strong className="text-stone-800 font-semibold">"{itemName}"</strong> : 'nội dung này'} không? Thao tác này sẽ loại bỏ hoàn toàn dữ liệu đã ghi sai.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText || 'Xác nhận xóa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
