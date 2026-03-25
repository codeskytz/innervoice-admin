import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminApi, { type ReferralSettings } from '../services/api';
import { Save, ShieldCheck } from 'lucide-react';

export function ReferralSettingsPage() {
  const { token } = useAdmin();
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSettings = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getReferralSettings(token);
      setSettings(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settings) return;

    setSaving(true);
    setError('');
    try {
      await adminApi.updateReferralSettings(token, settings);
      await loadSettings();
      alert('Referral settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save referral settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6" />
        Referral Settings
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
      )}

      {loading || !settings ? (
        <div className="bg-white rounded-lg shadow p-6">Loading...</div>
      ) : (
        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus Per Successful Invite (TZS)
              </label>
              <input
                type="number"
                min={0}
                value={settings.referral_bonus_tzs}
                onChange={(e) => setSettings((s) => (s ? { ...s, referral_bonus_tzs: Number(e.target.value) } : s))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Withdraw Minimum (TZS)
              </label>
              <input
                type="number"
                min={0}
                value={settings.referral_withdraw_min_tzs}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, referral_withdraw_min_tzs: Number(e.target.value) } : s))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Legacy Rate (TZS Per Credit)
              </label>
              <input
                type="number"
                min={1}
                value={settings.rate_tzs_per_credit}
                onChange={(e) => setSettings((s) => (s ? { ...s, rate_tzs_per_credit: Number(e.target.value) } : s))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deprecated: Use Buy/Sell rates below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buy Rate (TZS per Credit)
              </label>
              <input
                type="number"
                min={1}
                value={settings.buy_rate_tzs_per_credit}
                onChange={(e) => setSettings((s) => (s ? { ...s, buy_rate_tzs_per_credit: Number(e.target.value) } : s))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rate when users buy credits with money.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sell Rate (TZS per Credit)
              </label>
              <input
                type="number"
                min={1}
                value={settings.sell_rate_tzs_per_credit}
                onChange={(e) => setSettings((s) => (s ? { ...s, sell_rate_tzs_per_credit: Number(e.target.value) } : s))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rate when users sell credits for money.
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Currency Exchange Rates</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set exchange rates relative to TZS (Tanzanian Shilling). These rates are used for displaying prices in user's preferred currency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USD to TZS Rate
              </label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={settings.usd_to_tzs_rate}
                onChange={(e) => setSettings((s) => (s ? { ...s, usd_to_tzs_rate: Number(e.target.value) } : s))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                1 USD = {settings.usd_to_tzs_rate} TZS
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KSH to TZS Rate
              </label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={settings.ksh_to_tzs_rate}
                onChange={(e) => setSettings((s) => (s ? { ...s, ksh_to_tzs_rate: Number(e.target.value) } : s))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                1 KSH = {settings.ksh_to_tzs_rate} TZS
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
