'use client'

import { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { 
  SettingsIcon, 
  ToggleLeftIcon, 
  ToggleRightIcon,
  BellIcon,
  FolderIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  SaveIcon
} from 'lucide-react'

export default function SettingsClient({ session, isDemoMode }) {
  const [saving, setSaving] = useState(false)
  const [features, setFeatures] = useState({
    categoryManagement: true,
    lowStockNotifications: true,
    priceHistoryTracking: true,
    enhancedReporting: true,
    barcodeScanning: false, // Disabled as per user request
    batchOperations: false,
    activityLogging: true,
    quickActions: true
  })
  const [settings, setSettings] = useState({
    currency: 'IDR',
    language: 'id',
    lowStockThreshold: 10,
    notificationFrequency: 'daily',
    autoBackup: true,
    theme: 'light'
  })

  const toggleFeature = (featureName) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }))
  }

  const updateSetting = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }))
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // In demo mode, just simulate saving
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('[Settings] Demo mode - settings saved:', { features, settings })
        return
      }

      // In production, save to database/API
      // This would be implemented with actual API calls
      console.log('[Settings] Saving settings:', { features, settings })
      
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const featureList = [
    {
      key: 'categoryManagement',
      name: 'Category Management',
      description: 'Hierarchical product categorization system',
      icon: FolderIcon,
      color: 'text-blue-500'
    },
    {
      key: 'lowStockNotifications',
      name: 'Low Stock Notifications',
      description: 'Automated alerts for low inventory levels',
      icon: BellIcon,
      color: 'text-orange-500'
    },
    {
      key: 'priceHistoryTracking',
      name: 'Price History Tracking',
      description: 'Track and analyze price changes over time',
      icon: TrendingUpIcon,
      color: 'text-green-500'
    },
    {
      key: 'enhancedReporting',
      name: 'Enhanced Reporting',
      description: 'Advanced analytics and business intelligence',
      icon: SettingsIcon,
      color: 'text-purple-500'
    },
    {
      key: 'barcodeScanning',
      name: 'Barcode Scanning',
      description: 'Quick product lookup with barcode scanner',
      icon: AlertTriangleIcon,
      color: 'text-gray-400',
      disabled: true,
      disabledReason: 'Disabled per user request'
    },
    {
      key: 'batchOperations',
      name: 'Batch Operations',
      description: 'Bulk operations for products and inventory',
      icon: SettingsIcon,
      color: 'text-indigo-500'
    },
    {
      key: 'activityLogging',
      name: 'Activity Logging',
      description: 'Comprehensive audit trail for all operations',
      icon: SettingsIcon,
      color: 'text-gray-500'
    },
    {
      key: 'quickActions',
      name: 'Quick Actions',
      description: 'Shortcuts and recent items for faster navigation',
      icon: SettingsIcon,
      color: 'text-cyan-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengaturan {isDemoMode && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Demo</span>}
          </h1>
          <p className="text-gray-600 mt-1">Kelola pengaturan aplikasi dan fitur</p>
        </div>
        
        <TouchButton
          onClick={saveSettings}
          disabled={saving}
          variant="primary"
          className="flex items-center gap-2"
        >
          <SaveIcon className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </TouchButton>
      </div>

      {/* Feature Toggles */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Enhanced Features</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enable or disable enhanced features for gradual rollout
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {featureList.map((feature) => {
              const Icon = feature.icon
              const isEnabled = features[feature.key]
              const isDisabled = feature.disabled
              
              return (
                <div 
                  key={feature.key}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isDisabled 
                      ? 'bg-gray-50 border-gray-200' 
                      : isEnabled 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                    <div>
                      <h3 className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                        {feature.name}
                      </h3>
                      <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                      {isDisabled && feature.disabledReason && (
                        <p className="text-xs text-red-500 mt-1">
                          {feature.disabledReason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => !isDisabled && toggleFeature(feature.key)}
                    disabled={isDisabled}
                    className={`p-1 rounded-full transition-colors ${
                      isDisabled 
                        ? 'cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {isEnabled && !isDisabled ? (
                      <ToggleRightIcon className="w-8 h-8 text-green-500" />
                    ) : (
                      <ToggleLeftIcon className={`w-8 h-8 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Pengguna</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
              <input 
                type="text" 
                value={session.user.name} 
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={session.user.email} 
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Application Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Pengaturan Aplikasi</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mata Uang</label>
              <select 
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa</label>
              <select 
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input 
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Frequency
              </label>
              <select 
                value={settings.notificationFrequency}
                onChange={(e) => updateSetting('notificationFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Sistem</h2>
        </div>
        <div className="card-body">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Mode:</span> {isDemoMode ? 'Demo' : 'Production'}
              </div>
              <div>
                <span className="font-medium">Versi:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Environment:</span> development
              </div>
              <div>
                <span className="font-medium">Build:</span> {new Date().toLocaleDateString('id-ID')}
              </div>
              <div>
                <span className="font-medium">Enhanced Features:</span> {Object.values(features).filter(Boolean).length} enabled
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date().toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between">
        <TouchButton
          onClick={saveSettings}
          disabled={saving}
          variant="primary"
          className="flex items-center gap-2"
        >
          <SaveIcon className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </TouchButton>
        <a 
          href="/quick-login" 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </a>
      </div>
    </div>
  )
}