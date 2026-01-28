'use client'

import Link from 'next/link'
import TouchButton from '@/components/ui/TouchButton'
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  PlusIcon, 
  BarChart3Icon,
  PackageIcon,
  UsersIcon,
  SettingsIcon,
  FileTextIcon
} from 'lucide-react'

export default function QuickActions() {
  const primaryActions = [
    {
      label: 'Stock In',
      icon: ArrowDownIcon,
      href: '/transactions/stock-in',
      variant: 'primary',
      description: 'Receive inventory'
    },
    {
      label: 'Stock Out',
      icon: ArrowUpIcon,
      href: '/transactions/stock-out',
      variant: 'secondary',
      description: 'Issue inventory'
    },
    {
      label: 'Add Product',
      icon: PlusIcon,
      href: '/products?action=new',
      variant: 'secondary',
      description: 'New product'
    },
    {
      label: 'View Reports',
      icon: BarChart3Icon,
      href: '/reports',
      variant: 'secondary',
      description: 'Analytics & reports'
    }
  ]

  const secondaryActions = [
    {
      label: 'Products',
      icon: PackageIcon,
      href: '/products',
      description: 'Manage catalog'
    },
    {
      label: 'Suppliers',
      icon: UsersIcon,
      href: '/suppliers',
      description: 'Vendor management'
    },
    {
      label: 'Stock Adjustment',
      icon: SettingsIcon,
      href: '/transactions/stock-adjustment',
      description: 'Adjust quantities'
    },
    {
      label: 'Returns',
      icon: FileTextIcon,
      href: '/transactions/returns',
      description: 'Process returns'
    }
  ]

  return (
    <div className="space-y-6 mb-8">
      {/* Primary Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Common tasks and operations
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {primaryActions.map((action, index) => {
              const Icon = action.icon
              
              return (
                <Link key={index} href={action.href}>
                  <TouchButton
                    variant={action.variant}
                    className="flex flex-col items-center gap-3 h-auto py-6 px-4 w-full"
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </TouchButton>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            More Actions
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon
              
              return (
                <Link key={index} href={action.href}>
                  <TouchButton
                    variant="ghost"
                    className="flex items-center gap-3 justify-start h-auto py-4 px-4 text-left w-full"
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">{action.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {action.description}
                      </div>
                    </div>
                  </TouchButton>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}