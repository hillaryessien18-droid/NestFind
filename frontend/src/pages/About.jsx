import { Link } from 'react-router-dom';
import { ChevronLeft, Target, Users, Shield, Heart, MapPin, Building2, ArrowRight } from 'lucide-react';

const TEAM = [
  {
    name: 'Our Mission',
    description: 'To make finding a home in Nigeria simple, transparent, and accessible for everyone. We believe every Nigerian deserves a stress-free rental or property purchase experience.',
    icon: Target,
  },
  {
    name: 'Our Vision',
    description: 'To become Nigeria\'s most trusted real estate platform, connecting millions of people with their perfect homes while transforming how property transactions happen across Africa.',
    icon: Building2,
  },
  {
    name: 'Our Values',
    description: 'Transparency, trust, innovation, and community. We build with integrity and put users first in everything we do.',
    icon: Heart,
  },
];

const STATS = [
  { number: '10,000+', label: 'Properties Listed' },
  { number: '50,000+', label: 'Happy Users' },
  { number: '36', label: 'States Covered' },
  { number: '₦5B+', label: 'Transactions Processed' },
];

const VALUES = [
  {
    title: 'Trust & Safety',
    description: 'Every listing is verified. Every transaction is secure. We partner with Flutterwave to ensure your payments are protected by bank-grade encryption.',
    icon: Shield,
  },
  {
    title: 'Transparency',
    description: 'No hidden fees, no surprises. We provide clear pricing, honest reviews, and open communication between tenants and hosts.',
    icon: Target,
  },
  {
    title: 'Community First',
    description: 'We\'re building for Nigerians, by Nigerians. Our platform is designed to solve the real challenges of the Nigerian housing market.',
    icon: Users,
  },
  {
    title: 'Accessibility',
    description: 'Whether you\'re in Lagos, Abuja, Port Harcourt, or any city across Nigeria, NestFind works on any device with an internet connection.',
    icon: MapPin,
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">About NestFind</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          We&apos;re on a mission to transform how Nigerians find, rent, and buy homes. NestFind is the modern real estate platform built for the African market.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-2xl font-bold text-primary-600">{stat.number}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mission / Vision / Values */}
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {TEAM.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Our Story */}
      <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
        <div className="mt-4 space-y-4 text-gray-600">
          <p>
            NestFind was born from a simple frustration: finding a home in Nigeria shouldn't be this hard. Too many Nigerians have faced the challenges of unreliable listings, opaque pricing, and the stress of navigating the property market without trustworthy tools.
          </p>
          <p>
            We started with a vision to build a platform that puts power back in the hands of tenants, buyers, and landlords. Today, NestFind helps thousands of people across all 36 states and the FCT discover properties, make secure payments, and connect with verified hosts.
          </p>
          <p>
            Our platform supports both rental and purchase transactions, secured through Flutterwave's world-class payment infrastructure. From Lagos to Abuja, Port Harcourt to Kano, we're making property discovery and transactions seamless for millions of Nigerians.
          </p>
          <p>
            We're not just a listing site. We're building the infrastructure for Nigeria's real estate future — one transaction, one home, one happy user at a time.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Why Choose NestFind?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-primary-600 p-8 text-center text-white sm:p-12">
        <h2 className="text-2xl font-bold">Ready to Find Your Home?</h2>
        <p className="mt-3 text-primary-100">Join thousands of Nigerians who have found their perfect property on NestFind.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Browse Properties <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl border border-primary-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  );
}
