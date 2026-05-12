import { useState, useRef } from 'react';
import { useGiftStore } from '../stores/giftStore';
import type { Gift } from '../stores/giftStore';

interface GiftExchangePageProps {
  onBack: () => void;
}

export default function GiftExchangePage({ onBack }: GiftExchangePageProps) {
  const { gifts, addGift, updateGift, deleteGift } = useGiftStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formName, setFormName] = useState('');
  const [formPoints, setFormPoints] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingGift(null);
    setFormName('');
    setFormPoints('');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (gift: Gift) => {
    setEditingGift(gift);
    setFormName(gift.name);
    setFormPoints(gift.points.toString());
    setFormImageUrl(gift.imageUrl || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGift(null);
    setFormName('');
    setFormPoints('');
    setFormImageUrl('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formName.trim() || !formPoints.trim()) {
      alert('请填写礼物名称和兑换积分');
      return;
    }
    const points = parseInt(formPoints);
    if (isNaN(points) || points <= 0) {
      alert('积分必须是正整数');
      return;
    }

    if (editingGift) {
      updateGift(editingGift.id, formName.trim(), points, formImageUrl || undefined);
    } else {
      addGift(formName.trim(), points, formImageUrl || undefined);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个礼物吗？')) {
      deleteGift(id);
    }
  };

  const activeGiftCount = gifts.length;
  const avgPoints = gifts.length > 0
    ? Math.round(gifts.reduce((sum, g) => sum + g.points, 0) / gifts.length)
    : 0;

  return (
    <div className="min-h-screen pb-16" style={{ background: '#F3F4F6' }}>
      {/* 顶部导航栏 */}
      <header
        className="text-white shadow-md fixed top-0 left-0 right-0 z-50 flex items-center px-4 h-14"
        style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
      >
        <button
          onClick={onBack}
          className="active:scale-95 transition-transform hover:opacity-80 p-1 -ml-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-8">积分礼物管理</h1>
      </header>

      <div className="pt-14 px-4">
        {/* 新增礼物按钮 */}
        <section className="mb-4 mt-3">
          <button
            onClick={openAddModal}
            className="w-full rounded-2xl shadow-lg py-4 px-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-200 border-2 border-transparent hover:border-[#2170e4]"
            style={{ background: '#FFFFFF' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(33, 112, 228, 0.1)' }}
              >
                <svg className="w-5 h-5" style={{ color: '#0058be' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-base" style={{ color: '#1F2937' }}>新增礼物</h2>
                <p className="text-xs" style={{ color: '#6B7280' }}>创建一个新的奖励项目</p>
              </div>
            </div>
            <svg
              className="w-5 h-5 flex-shrink-0 transition-colors"
              style={{ color: '#6B7280' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3 shadow-sm border-l-4" style={{ background: '#FFFFFF', borderColor: '#10B981' }}>
            <p className="text-xs" style={{ color: '#6B7280' }}>活跃礼物数</p>
            <p className="text-xl font-bold" style={{ color: '#1F2937' }}>{activeGiftCount}</p>
          </div>
          <div className="rounded-xl p-3 shadow-sm border-l-4" style={{ background: '#FFFFFF', borderColor: '#F59E0B' }}>
            <p className="text-xs" style={{ color: '#6B7280' }}>平均所需积分</p>
            <p className="text-lg font-bold" style={{ color: '#1F2937' }}>
              {avgPoints} <span className="text-xs font-normal" style={{ color: '#6B7280' }}>积分</span>
            </p>
          </div>
        </div>

        {/* 礼物列表 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: '#6B7280' }}>当前库存</h3>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(132, 85, 239, 0.1)', color: '#6b38d4' }}
            >
              {gifts.length} 项
            </span>
          </div>

          {gifts.length === 0 ? (
            <div className="rounded-2xl p-6 shadow-md text-center" style={{ background: '#FFFFFF' }}>
              <svg className="w-12 h-12 mx-auto mb-3" style={{ color: '#d8d9e3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm" style={{ color: '#6B7280' }}>暂无礼物，点击上方添加</p>
            </div>
          ) : (
            gifts.map((gift) => (
              <div
                key={gift.id}
                className="rounded-2xl p-3 shadow-md flex items-center gap-3 hover:shadow-lg transition-shadow"
                style={{ background: '#FFFFFF' }}
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 overflow-hidden"
                  style={{ background: '#ecedf7' }}
                >
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-100 to-blue-100">
                      🎁
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-semibold text-sm truncate" style={{ color: '#1F2937' }}>{gift.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5" style={{ color: '#0058be' }}>
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-semibold text-xs">{gift.points} 积分</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(gift)}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all"
                    style={{ background: 'rgba(33, 112, 228, 0.1)', color: '#0058be' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(gift.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* 弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 shadow-xl sm:mb-0" style={{ background: '#FFFFFF' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#1F2937' }}>
                {editingGift ? '编辑礼物' : '新增礼物'}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90"
                style={{ background: '#f3f4f6', color: '#6B7280' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 图片上传 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>礼物图片</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border-2 border-dashed"
                  style={{ borderColor: '#d8d9e3', background: '#ecedf7' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formImageUrl ? (
                    <img src={formImageUrl} alt="预览" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <span className="text-sm" style={{ color: '#6B7280' }}>点击上传图片</span>
              </div>
            </div>

            {/* 礼物名称 */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7280' }}>礼物名称 *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例如：精美贴纸"
                className="w-full px-3 py-2.5 rounded-xl outline-none transition-all text-base"
                style={{ background: '#ecedf7', border: '1px solid #727785' }}
              />
            </div>

            {/* 兑换积分 */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7280' }}>兑换积分 *</label>
              <input
                type="number"
                value={formPoints}
                onChange={(e) => setFormPoints(e.target.value)}
                placeholder="例如：100"
                min="1"
                className="w-full px-3 py-2.5 rounded-xl outline-none transition-all text-base"
                style={{ background: '#ecedf7', border: '1px solid #727785' }}
              />
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 rounded-xl font-medium active:scale-[0.98] transition-transform text-base"
                style={{ background: '#f3f4f6', color: '#6B7280' }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 rounded-xl font-medium active:scale-[0.98] transition-transform text-white text-base"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
              >
                {editingGift ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}