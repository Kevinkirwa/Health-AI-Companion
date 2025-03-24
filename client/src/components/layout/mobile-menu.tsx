import { Link } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LanguageSelector, useLanguage } from "@/components/ui/language-selector";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navLinks,
  user,
  onLoginClick,
  onLogoutClick
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 h-full w-4/5 max-w-sm p-4 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('menu')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="flex flex-col space-y-4">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 py-2 font-medium"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="py-3 border-t border-gray-200 dark:border-gray-700 mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('language')}</h3>
            <LanguageSelector />
          </div>
          
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 py-2 font-medium"
                onClick={onClose}
              >
                {t('dashboard')}
              </Link>
              <Button 
                variant="default" 
                className="w-full mt-2"
                onClick={onLogoutClick}
              >
                {t('logout')}
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              className="w-full mt-2"
              onClick={onLoginClick}
            >
              {t('login')}
            </Button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
