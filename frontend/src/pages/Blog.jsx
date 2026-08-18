import { Link } from 'react-router-dom';
import { ChevronLeft, Calendar, ArrowRight, Clock, Tag } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 'rental-guide-lagos',
    title: 'The Complete Guide to Renting a Property in Lagos in 2026',
    excerpt: 'Lagos is Nigeria\'s most dynamic real estate market. Here\'s everything you need to know about renting an apartment in Lagos — from understanding agency fees to navigating the Lagos State Tenancy Law.',
    date: 'August 15, 2026',
    readTime: '8 min read',
    category: 'Tenant Guide',
    featured: true,
  },
  {
    id: 'ndpr-and-realestate',
    title: 'How NDPR Affects Real Estate Platforms in Nigeria',
    excerpt: 'The Nigeria Data Protection Regulation has significant implications for how property platforms handle user data. We break down what NDPR means for tenants, hosts, and platforms like NestFind.',
    date: 'August 10, 2026',
    readTime: '6 min read',
    category: 'Legal & Compliance',
  },
  {
    id: 'property-investment-2026',
    title: 'Top 10 Nigerian Cities for Property Investment in 2026',
    excerpt: 'From Lagos to Abuja, Port Harcourt to Enugu — discover which Nigerian cities offer the best returns on property investment this year, backed by data and market trends.',
    date: 'August 5, 2026',
    readTime: '10 min read',
    category: 'Investment',
  },
  {
    id: 'first-time-buyer-nigeria',
    title: 'First-Time Property Buyer? Here\'s Your Step-by-Step Checklist',
    excerpt: 'Buying your first property in Nigeria can be overwhelming. From due diligence to land registry verification, we walk you through every step of the process.',
    date: 'July 28, 2026',
    readTime: '12 min read',
    category: 'Buyer Guide',
  },
  {
    id: 'online-payment-safety',
    title: 'Is Online Property Payment Safe in Nigeria? What You Need to Know',
    excerpt: 'Many Nigerians are still cautious about making large payments online. We explain how Flutterwave\'s security measures protect your transactions and what to look for in a secure platform.',
    date: 'July 20, 2026',
    readTime: '7 min read',
    category: 'Payments',
  },
  {
    id: 'host-tips',
    title: '5 Tips for Property Hosts: How to Get More Bookings on NestFind',
    excerpt: 'Standing out in a competitive market takes strategy. Learn how to write compelling listings, price your property right, and attract quality tenants on NestFind.',
    date: 'July 15, 2026',
    readTime: '5 min read',
    category: 'Host Tips',
  },
  {
    id: 'rental-agreement-nigeria',
    title: 'Understanding Rental Agreements in Nigeria: Your Rights as a Tenant',
    excerpt: 'What should a rental agreement include? What are your rights under Nigerian law? We explain the key clauses every tenant should understand before signing.',
    date: 'July 8, 2026',
    readTime: '9 min read',
    category: 'Legal & Compliance',
  },
  {
    id: 'smart-home-trends',
    title: 'Smart Home Trends Coming to Nigerian Real Estate',
    excerpt: 'From solar panels to smart locks, Nigerian properties are getting an upgrade. Discover the tech trends that are reshaping how Nigerians live.',
    date: 'June 30, 2026',
    readTime: '6 min read',
    category: 'Trends',
  },
];

const CATEGORY_COLORS = {
  'Tenant Guide': 'bg-blue-100 text-blue-700',
  'Buyer Guide': 'bg-green-100 text-green-700',
  'Investment': 'bg-amber-100 text-amber-700',
  'Legal & Compliance': 'bg-purple-100 text-purple-700',
  'Payments': 'bg-red-100 text-red-700',
  'Host Tips': 'bg-primary-100 text-primary-700',
  'Trends': 'bg-cyan-100 text-cyan-700',
};

export default function Blog() {
  const featured = BLOG_POSTS.find((p) => p.featured);
  const posts = BLOG_POSTS.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">NestFind Blog</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Insights, guides, and news about Nigerian real estate, property investment, and the NestFind platform.
        </p>
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[featured.category] || 'bg-gray-100 text-gray-700'}`}>
                {featured.category}
              </span>
              <span className="text-xs text-gray-400">Featured</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">{featured.title}</h2>
            <p className="mt-3 text-gray-600">{featured.excerpt}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {featured.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {featured.readTime}</span>
            </div>
            <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
              Read Article <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'}`}>
                {post.category}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-gray-500">{post.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
              </div>
              <button className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                Read more
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Stay Updated</h2>
        <p className="mt-2 text-sm text-gray-500">Get the latest NestFind blog posts and Nigerian real estate insights delivered to your inbox.</p>
        <div className="mx-auto mt-4 flex max-w-md gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button className="shrink-0 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
            Subscribe
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">No spam. Unsubscribe anytime. Read our <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.</p>
      </div>
    </div>
  );
}
