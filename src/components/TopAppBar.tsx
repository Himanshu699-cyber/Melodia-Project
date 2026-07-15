import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { markAllNotificationsRead, clearNotifications } from '../store/playlistSlice';

export interface TopAppBarProps {
  readonly title?: string;
  readonly showSearch?: boolean;
  readonly onSearchChange?: (query: string) => void;
  readonly searchValue?: string;
  readonly onMobileMenuToggle?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'Dashboard',
  showSearch = false,
  onSearchChange,
  searchValue = '',
  onMobileMenuToggle,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.playlists);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 fixed top-0 right-0 w-full md:w-[calc(100%-280px)] z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-lg select-none">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-on-surface mr-md hover:text-primary transition-colors flex items-center"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <h2 className="hidden md:block font-headline-md text-headline-md font-bold text-on-surface truncate">
          {title}
        </h2>
      </div>

      {/* Search Input */}
      {showSearch && onSearchChange ? (
        <div className="flex-1 max-w-xl relative hidden sm:block mx-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="w-full bg-surface-container-low border border-surface-container-highest rounded-full py-2 pl-10 pr-4 text-body-sm focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder-on-surface-variant text-on-surface input-focus"
            placeholder="Search for artists, songs, or albums..."
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex-1 sm:block hidden"></div>
      )}

      {/* Trailing Actions */}
      <div className="flex items-center gap-md ml-auto relative">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
              if (unreadCount > 0) {
                dispatch(markAllNotificationsRead());
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-surface"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container border border-outline-variant rounded-md shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <span className="font-label-md text-label-md font-bold text-white">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => dispatch(clearNotifications())}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-on-surface-variant font-mono">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-surface-container-high transition-colors">
                      <p className="text-xs text-white">{n.message}</p>
                      <span className="text-[10px] text-on-surface-variant font-mono mt-1 block">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cast Button */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer hidden sm:flex">
          <span className="material-symbols-outlined">cast</span>
        </button>

        {/* Upload Button — NEW */}
        <Link
          to="/studio"
          className="px-md py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-label-md font-semibold rounded-md transition-colors hidden sm:flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Upload
        </Link>

        {/* User Profile Avatar */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-xs focus:outline-none"
            >
              <img
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant hover:border-primary transition-colors"
                src={user.avatarUrl}
              />
            </button>

            {/* User Options Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-md shadow-2xl py-1 z-50">
                <div className="px-4 py-2 border-b border-outline-variant bg-surface-container-low">
                  <p className="text-sm font-bold text-white truncate">{user.username}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="block px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-white transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="block px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-white transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-primary hover:bg-surface-container-high transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-primary-container text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopAppBar;
