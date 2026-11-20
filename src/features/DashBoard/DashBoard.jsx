import React from 'react'
import CustomButton from '@/components/common/Buttons/CustomButton'
import { Plus, Send, Settings, Sparkles, Trash2 } from 'lucide-react'

/**
 * Dashboard Component
 * Styled with modernized layout card formats and upgraded button theme showcases.
 */
const DashBoard = () => {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to Roadbuddy dashboard. Here is a preview of the modernized buttons and layout styles.
          </p>
        </div>
        <div className="flex gap-2">
          <CustomButton variant="outline" size="sm">
            <Settings className="h-4 w-4" /> Settings
          </CustomButton>
          <CustomButton variant="premium" size="sm">
            <Plus className="h-4 w-4" /> Add Action
          </CustomButton>
        </div>
      </div>

      {/* Button Styles Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Buttons showcase */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Modernized Button Variants</h3>
            <p className="text-xs text-slate-500">Premium design presets, soft shadows, hover transitions, and click feedback.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-slate-400 w-24">Premium (Gradient):</span>
              <CustomButton variant="premium">
                <Plus className="h-4 w-4" /> Create Card
              </CustomButton>
              <CustomButton variant="premium" size="lg">
                Large Premium
              </CustomButton>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-slate-400 w-24">Default (Brand):</span>
              <CustomButton variant="default">
                Default Action
              </CustomButton>
              <CustomButton variant="default" size="sm">
                Small Action
              </CustomButton>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-slate-400 w-24">Outline / Secondary:</span>
              <CustomButton variant="outline">
                Outline Button
              </CustomButton>
              <CustomButton variant="secondary">
                Secondary Button
              </CustomButton>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-slate-400 w-24">Special states:</span>
              <CustomButton variant="destructive">
                <Trash2 className="h-4 w-4" /> Delete Records
              </CustomButton>
              <CustomButton variant="premium" loading={true}>
                Loading
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Layout showcase */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions Card</h3>
            <p className="text-xs text-slate-500">Example of how buttons are sized, styled, and aligned to prevent stretching.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
            <div className="text-sm font-medium text-slate-700">No recent ticket files selected</div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Upload or create a new tickets management dossier to get started.</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400">Status: Idle</span>
            <div className="flex gap-2">
              <CustomButton variant="ghost" size="sm">Dismiss</CustomButton>
              <CustomButton variant="premium" size="sm">
                Get Started <Send className="h-3.5 w-3.5 ml-1" />
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoard