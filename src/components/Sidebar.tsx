import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export interface SidebarProps {
  readonly className?: string;
  readonly collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', collapsed = false }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <nav className={`${collapsed ? 'w-[80px]' : 'w-[280px]'} h-full fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-margin gap-base z-30 hidden md:flex select-none transition-all duration-300 ${className}`}>
      {/* Brand Logo */}
      <div className="px-margin mb-md flex items-center gap-base">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Melodify</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pro Studio</p>
          </div>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto px-md flex flex-col gap-xs">
              {!collapsed && (
                <p className="px-sm py-xs font-label-sm text-label-sm text-on-surface-variant uppercase mt-sm">
                  Discover
                </p>
              )}        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? 'justify-center' : 'gap-md'
                  } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                    isActive
                      ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                      : 'text-on-surface-variant'
                  }`
                }
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                {!collapsed && <span>Home</span>}
              </NavLink>

        <NavLink 
          to="/search" 
          className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? 'justify-center' : 'gap-md'
                  } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                    isActive
                      ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                      : 'text-on-surface-variant'
                  }`
                }
        >
          <span className="material-symbols-outlined">search</span>
          {!collapsed && <span>Search</span>}
        </NavLink>

        <NavLink 
          to="/generator" 
          className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? 'justify-center' : 'gap-md'
                } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                  isActive
                    ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                    : 'text-on-surface-variant'
                }`
              }
        >
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined">auto_awesome</span>
            {!collapsed && <span>AI Playlist</span>}
          </div>
              {!collapsed && (
                <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  magic_button
                </span>
              )}        </NavLink>

        {/* AI Music Studio Endpoint Nav Link */}
        <NavLink 
          to="/studio" 
          className={({ isActive }) =>
              `flex items-center ${
                collapsed ? 'justify-center' : 'gap-md'
              } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                isActive
                  ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                  : 'text-on-surface-variant'
              }`
            }
        >
          <span className="material-symbols-outlined">album</span>
          {!collapsed && <span>AI Studio</span>}
        </NavLink>

            {!collapsed && (
              <p className="px-sm py-xs font-label-sm text-label-sm text-on-surface-variant uppercase mt-md">
                Your Collection
              </p>
            )}        
        <NavLink 
          to="/library" 
          className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? 'justify-center' : 'gap-md'
                } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                  isActive
                    ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                    : 'text-on-surface-variant'
                }`
              }
        >
          <span className="material-symbols-outlined">library_music</span>
          {!collapsed && <span>Library</span>}
        </NavLink>

       {!collapsed && (
              <p className="px-sm py-xs font-label-sm text-label-sm text-on-surface-variant uppercase mt-md">
                Account
              </p>
            )}
        
        <NavLink 
          to="/profile" 
         className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? 'justify-center' : 'gap-md'
                  } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                    isActive
                      ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                      : 'text-on-surface-variant'
                  }`
                }
        >
          <span className="material-symbols-outlined">person</span>
          {!collapsed && <span>Profile</span>}
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? 'justify-center' : 'gap-md'
                  } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                    isActive
                      ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                      : 'text-on-surface-variant'
                  }`
                }
        >
          <span className="material-symbols-outlined">settings</span>
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {user && user.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              `flex items-center ${
                collapsed ? 'justify-center' : 'gap-md'
              } px-sm py-2 rounded-md hover:bg-surface-container-high transition-colors active:scale-95 ${
                isActive
                  ? 'text-primary font-bold border-l-2 border-primary bg-surface-container-low'
                  : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            {!collapsed && <span>Admin Dashboard</span>}
          </NavLink>
        )}
      </div>

      {/* Upgrade CTA */}
      <div className="px-margin mt-auto">
        <Link
  to="/settings"
  className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-2 rounded-full hover:bg-inverse-primary transition-colors flex items-center justify-center gap-xs"
>
  <span className="material-symbols-outlined text-[18px]">
    workspace_premium
  </span>

  {!collapsed && <span>Upgrade to Pro</span>}
</Link>
      </div>
    </nav>
  );
};

export default Sidebar;
