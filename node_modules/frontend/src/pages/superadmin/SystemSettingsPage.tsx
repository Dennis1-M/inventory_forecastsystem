import { AlertTriangle, Bell, Save, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

const SystemSettingsPage = () => {
  const [formState, setFormState] = useState({
    lowStockThreshold: '10',
    criticalStockThreshold: '5',
    expiryAlertDays: '30',
    autoReorderEnabled: 'false',
    whatsappAlertsEnabled: 'false',
    emailAlertsEnabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/settings');
      const settings = response.data || {};
      
      setFormState({
        lowStockThreshold: settings.lowStockThreshold || '10',
        criticalStockThreshold: settings.criticalStockThreshold || '5',
        expiryAlertDays: settings.expiryAlertDays || '30',
        autoReorderEnabled: settings.autoReorderEnabled || 'false',
        whatsappAlertsEnabled: settings.whatsappAlertsEnabled || 'false',
        emailAlertsEnabled: settings.emailAlertsEnabled || 'true',
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const settingsToUpdate = Object.entries(formState).map(([key, value]) => ({ key, value }));
      await apiService.post('/settings', { settings: settingsToUpdate });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating system settings:', err);
      setError(err.response?.data?.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2 text-green-600" />
          System Settings
        </h1>
        <p className="text-gray-600 mt-1">Configure system-wide settings for alerts, thresholds, and automation</p>
      </div>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="ml-3 text-green-800 font-medium">System settings updated successfully!</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="ml-3 text-red-800 font-medium">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inventory Thresholds Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Inventory Alert Thresholds
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                id="lowStockThreshold"
                value={formState.lowStockThreshold}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">Trigger warning when stock falls below this level</p>
            </div>

            <div>
              <label htmlFor="criticalStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                Critical Stock Threshold
              </label>
              <input
                type="number"
                name="criticalStockThreshold"
                id="criticalStockThreshold"
                value={formState.criticalStockThreshold}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">Trigger critical alert at this level</p>
            </div>

            <div>
              <label htmlFor="expiryAlertDays" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Alert Days
              </label>
              <input
                type="number"
                name="expiryAlertDays"
                id="expiryAlertDays"
                value={formState.expiryAlertDays}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500">Alert when products expire within this many days</p>
            </div>
          </div>
        </div>

        {/* Automation Settings Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2 text-blue-500" />
            Automation Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="autoReorderEnabled" className="font-medium text-gray-900">
                  Automatic Reordering
                </label>
                <p className="text-sm text-gray-600">Automatically create purchase orders when stock is low</p>
              </div>
              <select
                name="autoReorderEnabled"
                id="autoReorderEnabled"
                value={formState.autoReorderEnabled}
                onChange={handleInputChange}
                className="ml-4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-purple-500" />
            Notification Preferences
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="emailAlertsEnabled" className="font-medium text-gray-900">
                  Email Alerts
                </label>
                <p className="text-sm text-gray-600">Send alert notifications via email</p>
              </div>
              <select
                name="emailAlertsEnabled"
                id="emailAlertsEnabled"
                value={formState.emailAlertsEnabled}
                onChange={handleInputChange}
                className="ml-4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="whatsappAlertsEnabled" className="font-medium text-gray-900">
                  WhatsApp Alerts
                </label>
                <p className="text-sm text-gray-600">Send alert notifications via WhatsApp (requires Twilio configuration)</p>
              </div>
              <select
                name="whatsappAlertsEnabled"
                id="whatsappAlertsEnabled"
                value={formState.whatsappAlertsEnabled}
                onChange={handleInputChange}
                className="ml-4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Low stock alerts will trigger when inventory reaches the threshold</li>
                  <li>Critical alerts require immediate attention and create high-priority notifications</li>
                  <li>Automatic reordering creates draft purchase orders that require approval</li>
                  <li>WhatsApp alerts require valid Twilio credentials in system configuration</li>
                  <li>Changes to thresholds apply to all products unless overridden at product level</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage;
