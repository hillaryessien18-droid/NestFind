import { Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Globe, Rocket, Shield, Smartphone, Heart, Zap, Users, Code, Lightbulb, Target } from 'lucide-react';

const PERKS = [
  { icon: Heart, title: 'Health Insurance', description: 'Comprehensive health coverage for you and your family' },
  { icon: Zap, title: 'Competitive Pay', description: 'Above-market compensation benchmarked to local and global standards' },
  { icon: Users, title: 'Team Events', description: 'Regular team bonding, offsites, and social gatherings' },
  { icon: Code, title: 'Learning Budget', description: 'Annual stipend for courses, conferences, and professional development' },
  { icon: Clock, title: 'Flexible Hours', description: 'Work when you\'re most productive with flexible scheduling' },
  { icon: MapPin, title: 'Remote-Friendly', description: 'Work from anywhere in Nigeria with our remote-first culture' },
];

const PROJECTS = [
  {
    icon: Globe,
    title: 'Pan-African Expansion',
    description: 'Scaling NestFind beyond Nigeria to serve property seekers across Ghana, Kenya, and South Africa. Building the infrastructure for cross-border real estate discovery.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Experience',
    description: 'Developing a seamless mobile app for iOS and Android so users can browse, book, and pay for properties entirely from their phone.',
  },
  {
    icon: Shield,
    title: 'Trust & Verification System',
    description: 'Building a comprehensive host and property verification system with KYC integration to ensure every listing on NestFind is legitimate and safe.',
  },
  {
    icon: Rocket,
    title: 'Instant Booking Engine',
    description: 'Creating a real-time booking system with instant payment confirmation via Flutterwave, making property transactions as fast as hailing a ride.',
  },
];

const CULTURE_HIGHLIGHTS = [
  {
    icon: Lightbulb,
    title: 'Innovation Time',
    description: 'Every Friday afternoon is dedicated to side projects, experiments, and exploring new ideas. Some of our best features started as Friday projects.',
  },
  {
    icon: Target,
    title: 'Impact-Driven',
    description: 'We measure success by the number of Nigerians who find their perfect home through NestFind. Every line of code, every design, every decision ties back to our users.',
  },
  {
    icon: Users,
    title: 'Flat & Transparent',
    description: 'No bureaucratic hierarchies. Everyone has access to company metrics, strategy discussions, and direct lines to leadership. Your voice matters here.',
  },
];

export default function Careers() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Join Our Team</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Help us build the future of real estate in Nigeria. We&apos;re looking for passionate people who want to make a real difference.
        </p>
      </div>

      {/* Why Work Here */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Why Work at NestFind?</h2>
        <div className="mt-4 space-y-3 text-gray-600">
          <p>
            We&apos;re a fast-growing startup tackling one of Nigeria&apos;s biggest challenges — making housing accessible and transparent for everyone. Our team is small but mighty, and every person here has a direct impact on millions of users.
          </p>
          <p>
            We believe in building a workplace that&apos;s inclusive, ambitious, and fun. You&apos;ll work with talented people from across Nigeria, solve hard problems, and ship features that real people use every day.
          </p>
        </div>
      </div>

      {/* Perks */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Perks & Benefits</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{perk.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{perk.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What We're Building */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">What We&apos;re Building</h2>
        <p className="mt-2 text-gray-500">Exciting projects that are shaping the future of African real estate:</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PROJECTS.map((project) => {
            const Icon = project.icon;
            return (
              <div key={project.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{project.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{project.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Life at NestFind */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Life at NestFind</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {CULTURE_HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-gray-900 p-8 text-center text-white sm:p-12">
        <h2 className="text-2xl font-bold">Want to Be Part of This?</h2>
        <p className="mt-3 text-gray-400">
          We&apos;re always looking for passionate people who want to make a real impact. Send us a message at{' '}
          <a href="mailto:careers@nestfind.com" className="text-primary-400 hover:underline">careers@nestfind.com</a>{' '}
          and tell us about yourself.
        </p>
      </div>
    </div>
  );
}
