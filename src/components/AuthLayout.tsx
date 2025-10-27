
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footer: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthLayout({
  children,
  title,
  description,
  footer,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold text-matepeak-primary mb-2 inline-block">
            MatePeak
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {children}
        </div>

        <p className="text-center text-sm text-gray-600">
          {footer}{" "}
          <Link to={footerLink} className="font-medium text-matepeak-primary hover:text-matepeak-secondary">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
