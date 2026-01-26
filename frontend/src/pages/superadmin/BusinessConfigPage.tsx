import { Building2, Mail, MapPin, Phone, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiService from '../../services/api';

const BusinessConfigPage = () => {
  const [formState, setFormState] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    taxId: '',
    currency: 'KES',
    taxRate: '16',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBusinessConfig();
  }, []);

  const fetchBusinessConfig = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/settings');
      const settings = response.data || {};
      
      setFormState({
        businessName: settings.businessName || 'SmartInventory Inc.',
        businessEmail: settings.businessEmail || '',
        businessPhone: settings.businessPhone || '',
        businessAddress: settings.businessAddress || '',
        taxId: settings.taxId || '',
        currency: settings.currency || 'KES',
        taxRate: settings.taxRate || '16',
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching business configuration:', err);
      setError('Failed to load business configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      console.error('Error updating business configuration:', err);
      setError(err.response?.data?.message || 'Failed to update business configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Building2 className="h-6 w-6 mr-2 text-purple-600" />
          Business Configuration
        </h1>
        <p className="text-gray-600 mt-1">Configure your business information and company settings</p>
      </div>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="ml-3 text-green-800 font-medium">Business configuration updated successfully!</p>
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
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              id="businessName"
              value={formState.businessName}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
              placeholder="e.g., SmartInventory Inc."
            />
            <p className="mt-1 text-xs text-gray-500">This name will appear on receipts and reports</p>
          </div>

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Email */}
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Business Email
              </label>
              <input
                type="email"
                name="businessEmail"
                id="businessEmail"
                value={formState.businessEmail}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="info@business.com"
              />
            </div>

            {/* Business Phone */}
            <div>
              <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline h-4 w-4 mr-1" />
                Business Phone
              </label>
              <input
                type="tel"
                name="businessPhone"
                id="businessPhone"
                value={formState.businessPhone}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="+254 700 000000"
              />
            </div>
          </div>

          {/* Business Address */}
          <div>
            <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="inline h-4 w-4 mr-1" />
              Business Address
            </label>
            <textarea
              name="businessAddress"
              id="businessAddress"
              rows={3}
              value={formState.businessAddress}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="123 Main Street, Nairobi, Kenya"
            />
          </div>

          {/* Tax and Currency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tax ID/PIN */}
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / KRA PIN
              </label>
              <input
                type="text"
                name="taxId"
                id="taxId"
                value={formState.taxId}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="A000000000A"
              />
              <p className="mt-1 text-xs text-gray-500">KRA PIN for tax compliance</p>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                name="currency"
                id="currency"
                value={formState.currency}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                required
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            {/* Tax Rate */}
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (VAT %)
              </label>
              <input
                type="number"
                name="taxRate"
                id="taxRate"
                value={formState.taxRate}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                min="0"
                max="100"
                step="0.01"
                placeholder="16"
              />
              <p className="mt-1 text-xs text-gray-500">Standard VAT rate in Kenya is 16%</p>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>These settings will be used across all receipts, invoices, and reports</li>
                    <li>Make sure your business information is accurate and up-to-date</li>
                    <li>Changes will take effect immediately after saving</li>
                    <li>For tax compliance, ensure your KRA PIN is correctly entered</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={fetchBusinessConfig}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Business Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessConfigPage;
