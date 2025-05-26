import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Menu, Globe, ChevronRight, LogOut, User, Home, MessageSquare, Building, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import MobileMenu from "@/components/layout/mobile-menu";
import { LanguageSelector, useLanguage, Text } from "@/components/ui/language-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Header = () => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { t } = useLanguage();
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t('home'), icon: <Home className="w-4 h-4 mr-1" /> },
    { href: "/chatbot", label: t('chatbot'), icon: <MessageSquare className="w-4 h-4 mr-1" /> },
    { href: "/hospitals", label: t('hospitals'), icon: <Building className="w-4 h-4 mr-1" /> },
    { href: "/mental-health", label: t('mental_health'), icon: <Heart className="w-4 h-4 mr-1" /> },
    { href: "/first-aid", label: t('first_aid'), icon: <Activity className="w-4 h-4 mr-1" /> },
  ];

  const isActive = (path: string) => {
    return location === path 
      ? "text-primary-600 dark:text-primary-400 relative after:content-[''] after:absolute after:bottom-[-15px] after:left-0 after:w-full after:h-[3px] after:bg-primary-500 dark:after:bg-primary-400" 
      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200";
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
    <header className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'shadow-md py-2' : 'py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-2 rounded-lg shadow-sm">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Health AI</span>
            <span className="text-primary-600 dark:text-primary-400 font-bold"> Companion</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${isActive(link.href)} font-medium flex items-center py-2`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <TooltipProvider>
            <div className="hidden md:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <LanguageSelector />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Language</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {user ? (
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              >
                <Link href={getDashboardLink() || '/dashboard'} className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {t('dashboard')}
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  await logoutMutation.mutateAsync();
                  window.location.href = "/login";
                }}
                className="font-medium bg-primary-600 hover:bg-primary-700 text-white flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                {t('logout')}
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              >
                <Link href="/login">{t('login')}</Link>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                asChild
                className="font-medium bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Link href="/register">{t('register')}</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <MobileMenu open={mobileMenuOpen} setOpen={setMobileMenuOpen} />
    </header>
  );
};

export default Header;
