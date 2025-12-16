// src/pages/admin/Settings.tsx
import { useState } from 'react';
import { FaBell, FaDatabase, FaGlobe, FaLock, FaPalette, FaSave } from 'react-icons/fa';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Admin Dashboard',
    siteUrl: 'https://admin.example.com',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    enableNotifications: true,
    emailAlerts: true,
    maintenanceMode: false,
    apiRateLimit: 100,
    sessionTimeout: 30,
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings to API
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FaGlobe /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
    { id: 'advanced', label: 'Advanced', icon: <FaDatabase /> },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaSave />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">General Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site URL
                      </label>
                      <input
                        type="url"
                        value={settings.siteUrl}
                        onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="CET">Central European Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Notification Settings</h2>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enableNotifications}
                        onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Enable system notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.emailAlerts}
                        onChange={(e) => handleInputChange('emailAlerts', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Send email alerts for critical events</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Security Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Enable maintenance mode</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Appearance Settings</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Light Theme
                    </button>
                    <button className="p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
                      Dark Theme
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Advanced Settings</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Rate Limit (requests per minute)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-red-600 mb-4">These actions are irreversible. Please be cautious.</p>
            <div className="space-y-3">
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Clear All Cache
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}