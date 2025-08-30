

import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import UserIcon from './icons/UserIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import InfoIcon from './icons/InfoIcon';
import { KSEF_LOGO_BASE64 } from '@/assets/ksef-logo';

interface HeaderProps {
    user: User;
    onOpenProfile: () => void;
    onOpenAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenProfile, onOpenAbout }) => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={KSEF_LOGO_BASE64} alt="KSEF Logo" className="h-12 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold ml-4 text-gray-800 dark:text-white">KSEF Judging Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700 py-1">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <UserIcon className="w-4 h-4 mr-3" />
                    My Profile
                  </button>
                   <button
                    onClick={() => {
                        onOpenAbout();
                        setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <InfoIcon className="w-4 h-4 mr-3" />
                    About
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;