import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import MobileMenu from "@/components/layout/mobile-menu";
import { LanguageSelector, useLanguage, Text } from "@/components/ui/language-selector";

const Header = () => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { t } = useLanguage();
  
  const navLinks = [
    { href: "/", label: t('home') },
    { href: "/chatbot", label: t('chatbot') },
    { href: "/hospitals", label: t('hospitals') },
    { href: "/mental-health", label: t('mental_health') },
    { href: "/first-aid", label: t('first_aid') },
  ];

  const isActive = (path: string) => {
    return location === path 
      ? "text-primary-600 dark:text-primary-400" 
      : "text-foreground hover:text-primary-600 dark:hover:text-primary-400";
  };

  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-background dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
          </svg>
          <span className="font-bold text-xl text-foreground">AI Health Assistant</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${isActive(link.href)} font-medium`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </Button>
          
          {user ? (
            <div className="flex space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="hidden md:inline-flex"
              >
                <Link href={getDashboardLink() || '/dashboard'}>
                  {t('dashboard')}
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  await logoutMutation.mutateAsync();
                  window.location.href = '/';
                }}
                className="hidden md:inline-flex"
              >
                {t('logout')}
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
        user={user}
        onLoginClick={() => {
          setMobileMenuOpen(false);
          window.location.href = "/login";
        }}
        onLogoutClick={() => {
          setMobileMenuOpen(false);
          logoutMutation.mutate();
        }}
      />
    </header>
  );
};

export default Header;
