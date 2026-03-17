'use client';

import Link from 'next/link';
import { Plus, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">StoryAI Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/settings" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Settings className="w-5 h-5" />
            </Link>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create new storyboards or continue with your recent projects.
          </p>
        </div>

        {/* Create New Project Button */}
        <div className="mb-12">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Projects Grid */}
        <div>
          <h3 className="text-xl font-bold mb-6">Your Projects</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Placeholder for projects */}
            <div className="p-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center min-h-[200px] text-center">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No projects yet</p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  Create One
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
