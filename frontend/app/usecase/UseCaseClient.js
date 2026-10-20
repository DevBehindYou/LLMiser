'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import LLMiserHeader from '../../components/LLMiserHeader';
import LLMiserFooter from '../../components/LLMiserFooter';
import MobileDock from '../../components/MobileDock';
import { useThemeViewModel } from '../../viewmodels/useThemeViewModel';
const BlogModal = dynamic(() => import('../../components/BlogModal'), { ssr: false });
const ApiModal = dynamic(() => import('../../components/ApiModal'), { ssr: false });
const LegalModal = dynamic(() => import('../../components/LegalModal'), { ssr: false });

export default function UseCaseClient({ children }) {
  const { theme, toggleTheme } = useThemeViewModel();
  const [blogOpen, setBlogOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] font-sans transition-colors relative">
      {/* ── Global Header (1k Desktop / 1l Mobile) ── */}
      <LLMiserHeader
        activeTab="usecase"
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenBlog={() => setBlogOpen(true)}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">{children}</main>

      {/* ── Global Footer (1m) ── */}
      <LLMiserFooter
        onOpenBlog={() => setBlogOpen(true)}
        onOpenApi={() => setApiOpen(true)}
        onOpenLegal={(type) => setLegalModal(type)}
      />

      {/* ── Mobile Dock (1g) ── */}
      <MobileDock
        activeTab="why"
        onSelectTab={() => {}}
        onToggleTheme={toggleTheme}
        onOpenBlog={() => setBlogOpen(true)}
        onOpenMenu={() => {}}
      />

      {/* ── Modals ── */}
      {blogOpen && <BlogModal isOpen onClose={() => setBlogOpen(false)} />}
      {apiOpen && <ApiModal isOpen onClose={() => setApiOpen(false)} />}
      {legalModal && (
        <LegalModal isOpen onClose={() => setLegalModal(null)} initialTab={legalModal} />
      )}
    </div>
  );
}
