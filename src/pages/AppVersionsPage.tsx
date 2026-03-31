import { useState, useEffect } from 'react';
import { Plus, Smartphone, Tablet, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/api';
import { useAdmin } from '../contexts/AdminContext';

interface AppVersion {
  id: number;
  platform: 'android' | 'ios';
  version: string;
  min_required_version: string | null;
  version_code: number | null;
  download_url: string;
  store_url: string | null;
  release_notes: string | null;
  is_force_update: boolean;
  is_active: boolean;
  released_at: string;
  created_at: string;
}

export function AppVersionsPage() {
  const { token } = useAdmin();
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [formData, setFormData] = useState({
    platform: 'android' as 'android' | 'ios',
    version: '',
    min_required_version: '',
    version_code: '',
    download_url: '',
    store_url: '',
    release_notes: '',
    is_force_update: false,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await adminApi.getAppVersions(token);
      setVersions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch versions', err);
      setError('Failed to load app versions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSuccess('');

    const payload = {
      ...formData,
      version_code: formData.version_code ? parseInt(formData.version_code) : null,
    };

    try {
      if (editingVersion) {
        await adminApi.updateAppVersion(token, editingVersion.id, payload);
        setSuccess('Version updated successfully');
      } else {
        await adminApi.createAppVersion(token, payload);
        setSuccess('Version created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchVersions();
    } catch (err: any) {
      setError(err.message || 'Failed to save version');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this version?')) return;

    try {
      await adminApi.deleteAppVersion(token, id);
      setSuccess('Version deleted successfully');
      fetchVersions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete version');
    }
  };

  const openEditModal = (version: AppVersion) => {
    setEditingVersion(version);
    setFormData({
      platform: version.platform,
      version: version.version,
      version_code: version.version_code?.toString() || '',
      download_url: version.download_url,
      store_url: version.store_url || '',
      release_notes: version.release_notes || '',
      is_force_update: version.is_force_update,
      is_active: version.is_active,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingVersion(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      platform: 'android',
      version: '',
      min_required_version: '',
      version_code: '',
      download_url: '',
      store_url: '',
      release_notes: '',
      is_force_update: false,
      is_active: true,
    });
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'android' ? (
      <Smartphone className="w-5 h-5 text-green-500" />
    ) : (
      <Tablet className="w-5 h-5 text-blue-500" />
    );
  };

  const getPlatformLabel = (platform: string) => {
    return platform === 'android' ? 'Android' : 'iOS';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">App Versions</h2>
          <p className="text-gray-600 mt-1">
            Manage app updates and force users to update when necessary
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Version
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Versions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No app versions found. Create one to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Build</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Released</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {versions.map((version) => (
                <tr key={version.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(version.platform)}
                      <span className="text-sm font-medium text-gray-900">
                        {getPlatformLabel(version.platform)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {version.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600">
                      {version.min_required_version || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {version.version_code || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        version.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {version.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {new Date(version.released_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(version)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(version.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How it works</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Users will be prompted to update when app starts</li>
            <li>Set "Min Required Version" to block older app versions</li>
            <li>Users below min required version cannot skip the update</li>
            <li>Version comparison uses semantic versioning (1.2.3)</li>
            <li>Inactive versions are ignored by the update checker</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Version Code (Android)</h3>
          <p className="text-sm text-amber-700">
            For Android, version_code is the internal build number (integer). 
            It must increase with each release. The app checks both version string 
            and version_code for Android updates.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingVersion ? 'Edit Version' : 'Add New Version'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'android' | 'ios' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!editingVersion}
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version * (e.g., 1.2.3)
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                    pattern="\d+\.\d+(\.\d+)*"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Required Version
                </label>
                <input
                  type="text"
                  value={formData.min_required_version}
                  onChange={(e) => setFormData({ ...formData, min_required_version: e.target.value })}
                  placeholder="e.g., 1.0.0"
                  pattern="\d+\.\d+(\.\d+)*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users on versions below this will be forced to update.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version Code (Android build number)
                </label>
                <input
                  type="number"
                  value={formData.version_code}
                  onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
                  placeholder="e.g., 100"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Download URL * (Direct APK/IPA link)
                </label>
                <input
                  type="url"
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  placeholder="https://your-cdn.com/app-v1.0.0.apk"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store URL (Play Store / App Store)
                </label>
                <input
                  type="url"
                  value={formData.store_url}
                  onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                  placeholder="https://play.google.com/store/apps/details?id=com.yourapp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Notes
                </label>
                <textarea
                  value={formData.release_notes}
                  onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                  placeholder="What's new in this version..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_force_update}
                    onChange={(e) => setFormData({ ...formData, is_force_update: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Legacy Force Update Flag</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingVersion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
