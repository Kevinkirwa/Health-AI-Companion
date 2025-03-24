import { Link } from "wouter";

const Footer = () => {
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
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
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
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <div className="mb-4">
            <h4 className="text-white font-semibold text-base mb-2">About the Founder</h4>
            <p className="text-gray-400 text-sm">
              AI Health Assistant was founded by <span className="text-primary-400 font-medium">Kirwa</span>, 
              with a vision to make quality healthcare information accessible to everyone through 
              the power of artificial intelligence.
            </p>
          </div>
          <p className="text-sm">&copy; {currentYear} AI Health Assistant. All rights reserved.</p>
          <p className="mt-2 text-sm">Disclaimer: This application provides general health information and is not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
