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
    <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="bg-background dark:bg-gray-800 h-full w-4/5 max-w-sm p-4 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">{t('menu')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="space-y-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-foreground hover:text-primary-600 dark:hover:text-primary-400 py-2 font-medium"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-foreground mb-2">{t('language')}</h3>
          <LanguageSelector />
        </div>

        <div className="mt-8">
          {user ? (
            <div className="space-y-4">
              <Link
                href={getDashboardLink()}
                className="block text-foreground hover:text-primary-600 dark:hover:text-primary-400 py-2 font-medium"
                onClick={onClose}
              >
                {t('dashboard')}
              </Link>
              <Button
                variant="ghost"
                className="w-full text-foreground hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => {
                  onLogoutClick();
                  onClose();
                }}
              >
                {t('logout')}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                onLoginClick();
                onClose();
              }}
            >
              {t('login')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
