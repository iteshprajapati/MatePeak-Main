
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png" 
              alt="MatePeak Logo" 
              className="h-8"
            />
          </Link>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-matepeak-primary transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-matepeak-primary transition-colors"
            >
              Contact
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-600 hover:text-matepeak-primary transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-600 hover:text-matepeak-primary transition-colors"
            >
              Terms
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} MatePeak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
