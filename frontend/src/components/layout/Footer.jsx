import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">NestFind</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Find your perfect home. Browse thousands of properties for rent and sale.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Explore</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/properties" className="text-sm text-gray-500 hover:text-primary-600">All Properties</Link></li>
              <li><Link to="/properties?type=apartment" className="text-sm text-gray-500 hover:text-primary-600">Apartments</Link></li>
              <li><Link to="/properties?type=house" className="text-sm text-gray-500 hover:text-primary-600">Houses</Link></li>
              <li><Link to="/properties?type=condo" className="text-sm text-gray-500 hover:text-primary-600">Condos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-gray-500">About Us</span></li>
              <li><span className="text-sm text-gray-500">Careers</span></li>
              <li><span className="text-sm text-gray-500">Blog</span></li>
              <li><span className="text-sm text-gray-500">Support</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-gray-500">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-500">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} NestFind. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
