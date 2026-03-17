'use client';

import Link from 'next/link';
import { ArrowRight, Film, Sparkles, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-xl">StoryAI</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm hover:text-gray-300 transition">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Script to Storyboard in Minutes
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Transform your creative vision into stunning storyboards and concept art with AI-powered
          image generation and visual consistency tools.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition"
          >
            Start Creating <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 border border-slate-600 hover:border-slate-400 rounded-lg font-medium transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Powerful Features for Creators</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Film,
              title: 'Script Parsing',
              desc: 'Upload scripts and automatically extract scenes, characters, and shot suggestions',
            },
            {
              icon: Sparkles,
              title: 'AI Image Generation',
              desc: 'Generate stunning visuals with prompt refinement and visual consistency controls',
            },
            {
              icon: Users,
              title: 'Creative Collaboration',
              desc: 'Save character profiles, style presets, and reference libraries for consistent work',
            },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 transition">
              <feature.icon className="w-10 h-10 text-orange-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to bring your stories to life?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join creators, filmmakers, and storytellers using StoryAI.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-lg transition"
        >
          Sign Up Free <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} StoryAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
