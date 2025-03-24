import { Link } from "wouter";
import { useLanguage, Text, LanguageSelector } from "@/components/ui/language-selector";
import { Globe } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
              </svg>
              <span className="font-bold text-xl text-white">AI Health Assistant</span>
            </div>
            <p className="mb-4">
              AI-powered health guidance and support for everyone, anywhere.
            </p>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                </svg>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                </svg>
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401m-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4"/>
                </svg>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link href="/chatbot" className="hover:text-white">AI Health Chatbot</Link></li>
              <li><Link href="/hospitals" className="hover:text-white">Hospital Finder</Link></li>
              <li><Link href="/mental-health" className="hover:text-white">Mental Health Support</Link></li>
              <li><Link href="/first-aid" className="hover:text-white">First Aid Guide</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Doctor Appointments</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">About Us</Link></li>
              <li><Link href="/" className="hover:text-white">Our Team</Link></li>
              <li><Link href="/" className="hover:text-white">Careers</Link></li>
              <li><Link href="/" className="hover:text-white">Press</Link></li>
              <li><Link href="/" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-white">Cookie Policy</Link></li>
              <li><Link href="/" className="hover:text-white">HIPAA Compliance</Link></li>
              <li><Link href="/" className="hover:text-white">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6">
          {/* Mission Statement */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary-900/30 to-gray-900/20 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-primary-600 p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl">Our Mission</h3>
            </div>
            <p className="text-gray-300 mb-3 leading-relaxed">
              AI Health Assistant is committed to transforming healthcare access across Africa, where medical 
              resources are often scarce and unevenly distributed. We believe that everyone deserves access to 
              quality healthcare information, regardless of geographic or economic barriers.
            </p>
            <div className="flex flex-col md:flex-row md:space-x-6 text-sm mt-4">
              <div className="mb-3 md:mb-0">
                <h4 className="text-primary-400 font-semibold mb-1">Vision</h4>
                <p className="text-gray-400">A world where healthcare knowledge is accessible to all, empowering individuals to make informed health decisions.</p>
              </div>
              <div>
                <h4 className="text-primary-400 font-semibold mb-1">Impact</h4>
                <p className="text-gray-400">Bridging healthcare gaps in underserved regions through AI-powered health information, guidance, and resources.</p>
              </div>
            </div>
          </div>

          {/* Language Support Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg mb-6">
            <div className="md:w-2/3">
              <div className="flex items-center mb-3">
                <div className="bg-primary-600 rounded-full p-2 flex items-center justify-center mr-3">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg">{t('language_support')}</h4>
              </div>
              <p className="text-gray-300 text-sm md:pr-6">
                {t('language_support_message')}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🇺🇸 English
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🇰🇪 Swahili
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🇫🇷 French
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🇪🇹 Amharic
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🇳🇬 Hausa
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🇪🇬 Arabic
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:w-1/3 md:text-right">
              <div className="inline-block">
                <h5 className="text-white text-sm mb-2">{t('change_language')}</h5>
                <div className="inline-block">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="md:w-2/3">
              <div className="flex items-center mb-3">
                <div className="bg-primary-500 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">K</span>
                </div>
                <h4 className="text-white font-semibold text-lg">{t('from_founder')}</h4>
              </div>
              <p className="text-gray-400 text-sm md:pr-6">
                {t('founder_quote')}
              </p>
              <p className="text-primary-400 font-medium text-sm mt-2">— Kirwa, {t('founder_title')}</p>
            </div>
            <div className="mt-4 md:mt-0 md:w-1/3 md:text-right">
              <Link href="/" className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded transition-colors">
                <span>{t('african_initiative')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ml-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center border-t border-gray-800 pt-4">
            <p className="text-sm">&copy; {currentYear} AI Health Assistant. All rights reserved.</p>
            <p className="mt-2 text-sm">Disclaimer: This application provides general health information and is not a substitute for professional medical advice.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
