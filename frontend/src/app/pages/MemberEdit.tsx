import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { getMypage, updateMember } from '../api/member';
import { ApiError } from '../api/ApiError';

export function MemberEditContent({
  embedded = false,
  onDone,
}: {
  embedded?: boolean;
  onDone?: () => void;
}) {
  const [formData, setFormData] = useState({ name: '', address: '', phoneNumber: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    getMypage()
      .then((res) => {
        if (!cancelled) {
          setFormData({
            name: res.name ?? '',
            address: res.address ?? '',
            phoneNumber: res.phoneNumber ?? '',
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            navigate('/login', { replace: true });
            return;
          }
          setError(err instanceof Error ? err.message : '정보를 불러오는 중 오류가 발생했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await updateMember(formData);
      setSuccess(true);
      if (embedded) {
        setTimeout(() => onDone?.(), 800);
      } else {
        setTimeout(() => navigate('/mypage'), 800);
      }
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className={embedded ? 'w-full' : 'w-full max-w-[500px] mx-auto py-12 px-4'}>
        <div className="py-10 flex items-center justify-center">
          <p className="text-gray-500 font-sans">정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? 'w-full max-w-xl' : 'w-full max-w-[500px] mx-auto py-12 px-4 md:py-16'}>
      <h1 className={`${embedded ? 'text-[15px]' : 'text-xl'} font-semibold text-gray-800 mb-6 font-serif`}>
        개인정보 수정
      </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <p className="text-red-600 text-[13px] font-medium" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-[13px] font-medium" role="status">
              개인정보가 수정되었습니다.
            </p>
          )}
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              전화번호
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-[13px] font-medium text-gray-700 mb-1.5">
              주소
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || success}
              className="w-1/3 min-w-[120px] py-3 rounded-lg bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 disabled:opacity-60 disabled:pointer-events-none transition-colors"
            >
              {submitting ? '처리 중...' : success ? '완료' : '수정 완료'}
            </button>
          </div>
        </form>
        {!embedded && (
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            마이페이지로 돌아가기
          </button>
        )}
    </div>
  );
}

export default function MemberEdit() {
  const navigate = useNavigate();
  return (
    <Layout onLogoClick={() => navigate('/')}>
      <MemberEditContent />
    </Layout>
  );
}
