import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminApi from '../services/api';
import { CheckCircle, XCircle, Clock, Wallet, User, CreditCard } from 'lucide-react';

interface Withdrawal {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  amount_tzs: number;
  full_name: string;
  account_number: string;
  bank_name: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

const formatTZS = (value: number) =>
  new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-TZ', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function WithdrawalsPage() {
  const { token } = useAdmin();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  const loadWithdrawals = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getWithdrawals(token, statusFilter);
      setWithdrawals(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  const handleApprove = async (withdrawal: Withdrawal) => {
    if (!token) return;
    setProcessingId(withdrawal.id);
    try {
      await adminApi.approveWithdrawal(token, withdrawal.id);
      await loadWithdrawals();
      alert('Withdrawal approved successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!token || !selectedWithdrawal || !rejectReason.trim()) return;
    setProcessingId(selectedWithdrawal.id);
    try {
      await adminApi.rejectWithdrawal(token, selectedWithdrawal.id, rejectReason);
      await loadWithdrawals();
      setRejectModalOpen(false);
      setSelectedWithdrawal(null);
      alert('Withdrawal rejected and amount refunded');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Wallet className="w-6 h-6" />
        Withdrawal Requests
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow p-2 flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">Loading...</div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No {statusFilter} withdrawals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{withdrawal.user_name}</p>
                      <p className="text-sm text-gray-500">{withdrawal.user_email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="ml-1">{withdrawal.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{formatTZS(withdrawal.amount_tzs)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Requested</p>
                      <p className="text-sm text-gray-900">{formatDate(withdrawal.created_at)}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <p className="font-medium text-blue-900">Payment Details</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 mb-1">Full Name</p>
                        <p className="font-medium text-blue-900">{withdrawal.full_name}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 mb-1">Bank Name</p>
                        <p className="font-medium text-blue-900">{withdrawal.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 mb-1">Account Number</p>
                        <p className="font-medium text-blue-900">{withdrawal.account_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {withdrawal.admin_notes && (
                    <div className="mt-4 bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                      <p className="text-sm text-gray-900">{withdrawal.admin_notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {withdrawal.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => handleApprove(withdrawal)}
                      disabled={processingId === withdrawal.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(withdrawal)}
                      disabled={processingId === withdrawal.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Withdrawal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this withdrawal? The amount will be refunded to the user.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">User</p>
              <p className="font-medium">{selectedWithdrawal.user_name}</p>
              <p className="text-sm text-gray-500 mt-2">Amount</p>
              <p className="font-medium">{formatTZS(selectedWithdrawal.amount_tzs)}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection (Required)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId === selectedWithdrawal.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === selectedWithdrawal.id ? 'Processing...' : 'Reject & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
