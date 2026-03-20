import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminApi, { type CreditPackage } from '../services/api';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export function CreditsPage() {
  const { token } = useAdmin();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<CreditPackage>>({
    name: '',
    credits: 0,
    price_tzs: 0,
    bonus: 0,
    is_popular: false,
    is_active: true,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadPackages = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getCreditPackages(token);
      setPackages(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credit packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadPackages();
  }, [token]);

  const resetForm = () => {
    setForm({
      name: '',
      credits: 0,
      price_tzs: 0,
      bonus: 0,
      is_popular: false,
      is_active: true,
      sort_order: 0,
    });
    setEditingId(null);
  };

  const handleEdit = (pkg: CreditPackage) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      credits: pkg.credits,
      price_tzs: pkg.price_tzs,
      bonus: pkg.bonus,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
    });
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Delete this credit package?')) return;
    try {
      await adminApi.deleteCreditPackage(token, id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete credit package');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateCreditPackage(token, editingId, form);
      } else {
        await adminApi.createCreditPackage(token, form);
      }
      await loadPackages();
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save credit package');
    } finally {
      setSaving(false);
    }
  };

  const formatTZS = (value: number) =>
    new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(
      value || 0
    );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Credit Packages</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {editingId ? 'Edit Credit Package' : 'Create Credit Package'}
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
            <input
              type="number"
              min={1}
              value={form.credits ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, credits: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS)</label>
            <input
              type="number"
              min={1}
              value={form.price_tzs ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, price_tzs: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Credits</label>
            <input
              type="number"
              min={0}
              value={form.bonus ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, bonus: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              min={0}
              value={form.sort_order ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-4 mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.is_popular}
                onChange={(e) => setForm((f) => ({ ...f, is_popular: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Mark as \"Best Value\"</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
          <div className="md:col-span-3 flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Package' : 'Create Package'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Packages table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bonus</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price (TZS)</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Popular</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Active</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Loading packages...
                </td>
              </tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No credit packages configured yet.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pkg.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{pkg.credits}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{pkg.bonus}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatTZS(pkg.price_tzs)}</td>
                  <td className="px-6 py-4 text-sm">
                    {pkg.is_popular ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        <CheckCircle className="w-4 h-4" />
                        Best Value
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                        <XCircle className="w-4 h-4" />
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={async () => {
                        if (!token) return;
                        try {
                          await adminApi.updateCreditPackage(token, pkg.id, {
                            is_active: !pkg.is_active,
                          });
                          await loadPackages();
                        } catch (err) {
                          alert(
                            err instanceof Error ? err.message : 'Failed to toggle active state'
                          );
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        pkg.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

