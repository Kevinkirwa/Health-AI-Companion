import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import LoginModal from "@/components/ui/login-modal";
import MobileMenu from "@/components/layout/mobile-menu";

const Header = () => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/chatbot", label: "AI Chatbot" },
    { href: "/hospitals", label: "Find Hospitals" },
    { href: "/mental-health", label: "Mental Health" },
    { href: "/first-aid", label: "First Aid" },
  ];

  const isActive = (path: string) => {
    return location === path 
      ? "text-primary-500 dark:text-primary-400" 
      : "text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400";
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
          </svg>
          <span className="font-bold text-xl text-primary-600 dark:text-primary-400">AI Health Assistant</span>
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
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="hidden md:inline-flex"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowLoginModal(true)}
              className="hidden md:inline-flex"
            >
              Login
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
          setShowLoginModal(true);
        }}
        onLogoutClick={() => {
          setMobileMenuOpen(false);
          logoutMutation.mutate();
        }}
      />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
};

export default Header;
