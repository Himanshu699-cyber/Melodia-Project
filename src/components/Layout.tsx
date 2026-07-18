import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopAppBar from './TopAppBar';
import PlaybackBar from './PlaybackBar';

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly showSearch?: boolean;
  readonly onSearchChange?: (query: string) => void;
  readonly searchValue?: string;
  readonly playbackBarVariant?: 'default' | 'expanded'; // NEW
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Dashboard',
  showSearch = false,
  onSearchChange,
  searchValue = '',
  playbackBarVariant = 'default', // NEW
}) => {



  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans antialiased overflow-x-hidden">
      {/* Sidebar - Desktop */}
            <Sidebar collapsed={sidebarCollapsed} />
                   {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-40 w-6 h-12 items-center justify-center bg-surface-container border border-outline-variant rounded-r-md hover:bg-surface-container-high transition-all duration-300 ${
                sidebarCollapsed ? 'left-[80px]' : 'left-[280px]'
              }`}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
      {/* Sidebar - Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Sidebar Drawer */}
          <Sidebar className="!flex relative z-50 h-full border-r border-outline-variant shadow-2xl animate-slide-in" />
        </div>
      )}

      {/* Content wrapper */}
      <div
              className={`flex-1 flex flex-col ${
                sidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'
              } w-full min-h-screen relative transition-all duration-300`}
            >
        <TopAppBar
              title={title}
              showSearch={showSearch}
              onSearchChange={onSearchChange}
              searchValue={searchValue}
              onMobileMenuToggle={() => setMobileMenuOpen(true)}
              sidebarCollapsed={sidebarCollapsed} // NEW
            />

        {/* Scrollable page body */}
        <main className="flex-grow p-margin mt-16 pb-[120px] md:pb-[100px] overflow-y-auto">
          {children}
        </main>

        {/* Bottom Playback bar */}
        <PlaybackBar variant={playbackBarVariant} /> {/* was: <PlaybackBar /> */}
      </div>
    </div>
  );
};

export default Layout;
