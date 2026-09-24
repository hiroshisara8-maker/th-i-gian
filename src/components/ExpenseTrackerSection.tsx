import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  PieChart, 
  Calendar,
  Utensils,
  BookOpen,
  Bus,
  ShoppingBag,
  Home,
  Gamepad2,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory, ExpenseType } from '../types';
import { 
  formatVND, 
  getTodayDateString, 
  getExpenseCategoryBadge 
} from '../utils/helpers';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ExpenseTrackerSectionProps {
  expenses: ExpenseItem[];
  onAddExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTrackerSection: React.FC<ExpenseTrackerSectionProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'month'>('all');
  const [filterType, setFilterType] = useState<'all' | 'chi' | 'thu'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    amount: number | '';
    type: ExpenseType;
    category: ExpenseCategory;
    date: string;
    notes: string;
  }>({
    title: '',
    amount: '',
    type: 'chi',
    category: 'an_uong',
    date: getTodayDateString(),
    notes: '',
  });

  const today = getTodayDateString();
  const currentMonthPrefix = today.slice(0, 7); // "YYYY-MM"

  const handleOpenAddModal = (type: ExpenseType = 'chi') => {
    setFormData({
      title: '',
      amount: '',
      type,
      category: type === 'chi' ? 'an_uong' : 'khac',
      date: today,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) return;

    onAddExpense({
      title: formData.title,
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      notes: formData.notes,
    });
    setIsModalOpen(false);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesPeriod = true;
    if (filterPeriod === 'today') {
      matchesPeriod = item.date === today;
    } else if (filterPeriod === 'month') {
      matchesPeriod = item.date.startsWith(currentMonthPrefix);
    }

    let matchesType = true;
    if (filterType !== 'all') {
      matchesType = item.type === filterType;
    }

    return matchesSearch && matchesPeriod && matchesType;
  });

  // Calculations
  const totalExpense = expenses
    .filter((e) => e.type === 'chi')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter((e) => e.type === 'thu')
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalExpense;

  // Breakdown by category for 'chi'
  const categoryTotals: Record<ExpenseCategory, number> = {
    an_uong: 0,
    hoc_tap: 0,
    di_lai: 0,
    mua_sam: 0,
    nha_tro: 0,
    giai_tri: 0,
    khac: 0,
  };

  expenses.forEach((e) => {
    if (e.type === 'chi') {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }
  });

  const categoryEntries = Object.entries(categoryTotals) as [ExpenseCategory, number][];
  const sortedCategories = categoryEntries
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                Tài chính cá nhân
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight mt-1">
              Quản lý chi tiêu & Mua sắm
            </h2>
            <p className="text-xs text-stone-600">
              Ghi lại các khoản chi tiêu hàng ngày để dễ theo dõi và cân nhắc hợp lý khi mua sắm
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleOpenAddModal('chi')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi khoản chi</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('thu')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100/70 text-amber-900 hover:bg-amber-100 border border-amber-300 text-xs sm:text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Khoản thu</span>
            </button>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 to-white border border-stone-200/80 shadow-2xs">
            <span className="text-xs font-medium text-stone-600 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-stone-600" />
              Số dư hiện tại
            </span>
            <div className={`text-2xl font-bold mt-1.5 ${balance >= 0 ? 'text-stone-900' : 'text-rose-600'}`}>
              {formatVND(balance)}
            </div>
            <p className="text-[11px] text-stone-600 mt-1">
              Khoản tích lũy còn lại
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/50 to-white border border-rose-100 shadow-2xs">
            <span className="text-xs font-medium text-rose-700 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Tổng đã chi tiêu
            </span>
            <div className="text-2xl font-bold text-rose-700 mt-1.5">
              {formatVND(totalExpense)}
            </div>
            <p className="text-[11px] text-stone-600 mt-1">
              Cân nhắc trước các khoản mua sắm lớn
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/40 to-white border border-amber-200/70 shadow-2xs">
            <span className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              Tổng thu nhập / Trợ cấp
            </span>
            <div className="text-2xl font-bold text-amber-850 text-stone-800 mt-1.5">
              {formatVND(totalIncome)}
            </div>
            <p className="text-[11px] text-stone-600 mt-1">
              Lương, làm thêm, gia đình gửi
            </p>
          </div>
        </div>

        {/* Filter and search bar */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả thời gian' },
              { id: 'today', label: 'Hôm nay' },
              { id: 'month', label: 'Tháng này' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterPeriod(btn.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                  filterPeriod === btn.id
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'
                }`}
              >
                {btn.label}
              </button>
            ))}

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 text-stone-700 bg-stone-50 hover:bg-white focus:outline-none"
            >
              <option value="all">Tất cả loại giao dịch</option>
              <option value="chi">Chỉ khoản chi</option>
              <option value="thu">Chỉ khoản thu</option>
            </select>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-stone-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 2-column layout: Left is transactions list, Right is Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transactions List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-stone-800 text-base">
              Lịch sử thu chi
            </h3>
            <span className="text-xs text-stone-600">
              {filteredExpenses.length} giao dịch
            </span>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-stone-600 text-xs">
              <Wallet className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              Chưa có giao dịch chi tiêu nào theo tiêu chí tìm kiếm.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExpenses
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((exp) => {
                  const catBadge = getExpenseCategoryBadge(exp.category);
                  const isExpense = exp.type === 'chi';

                  return (
                    <div
                      key={exp.id}
                      className="p-3.5 rounded-xl border border-stone-200/80 hover:border-stone-300 bg-white transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpense ? 'bg-rose-50 text-rose-600' : 'bg-amber-100/70 text-amber-800'
                        }`}>
                          {isExpense ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-stone-800 text-sm">
                              {exp.title}
                            </h4>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${catBadge.color}`}>
                              {catBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-600 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-stone-600" />
                              {exp.date}
                            </span>
                            {exp.notes && (
                              <span className="truncate max-w-[180px]">
                                • {exp.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-bold text-sm sm:text-base whitespace-nowrap ${
                          isExpense ? 'text-rose-600' : 'text-stone-800 font-semibold'
                        }`}>
                          {isExpense ? '-' : '+'}{formatVND(exp.amount)}
                        </span>
                        <button
                          onClick={() => setExpenseToDelete(exp)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                          title="Xóa khoản thu chi ghi sai"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Right: Category Distribution & Advice (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-800 text-base">
                Phân tích hạng mục chi tiêu
              </h3>
              <p className="text-xs text-stone-600">
                Tỷ trọng phân bổ các khoản tiền đã chi
              </p>
            </div>

            {sortedCategories.length === 0 ? (
              <p className="text-xs text-stone-600 py-6 text-center">
                Chưa có dữ liệu chi tiêu để phân tích.
              </p>
            ) : (
              <div className="space-y-3.5">
                {sortedCategories.map(([cat, amount]) => {
                  const badge = getExpenseCategoryBadge(cat);
                  const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-700 flex items-center gap-1.5">
                          <span>{badge.label}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-800">{formatVND(amount)}</span>
                          <span className="text-[11px] text-stone-600 w-8 text-right font-mono">
                            {percent}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Advice card */}
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl p-4.5 border border-amber-200/60 text-stone-700 text-xs space-y-2">
            <h4 className="font-semibold text-amber-900 flex items-center gap-1.5">
              💡 Lời khuyên cân nhắc mua sắm
            </h4>
            <p className="text-stone-600 leading-relaxed">
              Trước khi mua sắm một món đồ không thuộc nhóm thiết yếu (ăn uống, học tập), hãy áp dụng nguyên tắc "chờ 24 giờ". Thói quen ghi chép mỗi ngày sẽ giúp bạn tiết kiệm trung bình 15-25% sinh hoạt phí!
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add Expense / Income */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-800 text-lg">
                {formData.type === 'chi' ? 'Ghi nhận khoản chi tiêu' : 'Ghi nhận khoản thu nhập'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-600 hover:text-stone-600 p-1 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'chi', category: 'an_uong' })}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    formData.type === 'chi' ? 'bg-white text-rose-600 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Khoản chi (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'thu', category: 'khac' })}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    formData.type === 'thu' ? 'bg-white text-amber-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Khoản thu (+)
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Nội dung chi tiêu <span className="text-rose-500">*</span>
                  </label>
                  {formData.title && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: '' })}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Xóa tên ghi sai
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Ăn trưa bún bò, Mua giáo trình..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {formData.title && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Số tiền (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    {formData.amount !== '' && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: '' })}
                        className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Xóa số tiền
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    placeholder="35000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                  >
                    <option value="an_uong">Ăn uống</option>
                    <option value="hoc_tap">Học tập</option>
                    <option value="di_lai">Đi lại</option>
                    <option value="mua_sam">Mua sắm</option>
                    <option value="nha_tro">Tiền nhà / trọ</option>
                    <option value="giai_tri">Giải trí</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ngày giao dịch
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Ghi chú thêm
                  </label>
                  {formData.notes && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, notes: '' })}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Xóa ghi chú
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setFormData({
                    title: '',
                    amount: '',
                    type: 'chi',
                    category: 'an_uong',
                    date: today,
                    notes: '',
                  })}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  title="Xóa trắng các ô đã nhập"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa trắng form</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 shadow-xs"
                  >
                    Lưu giao dịch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        title="Xóa khoản thu chi ghi sai"
        itemName={expenseToDelete?.title}
        message={`Bạn có chắc muốn xóa giao dịch "${expenseToDelete?.title}" (${expenseToDelete ? formatVND(expenseToDelete.amount) : ''}) không? Thao tác này sẽ xóa vĩnh viễn nội dung ghi sai.`}
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};

