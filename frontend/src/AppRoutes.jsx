import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ui/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Properties = lazy(() => import('@/pages/Properties'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const CreateProperty = lazy(() => import('@/pages/CreateProperty'));
const EditProperty = lazy(() => import('@/pages/EditProperty'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const MyProperties = lazy(() => import('@/pages/MyProperties'));
const SavedProperties = lazy(() => import('@/pages/SavedProperties'));
const Enquiries = lazy(() => import('@/pages/Enquiries'));
const Profile = lazy(() => import('@/pages/Profile'));
const Payment = lazy(() => import('@/pages/Payment'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentHistory = lazy(() => import('@/pages/PaymentHistory'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Receipt = lazy(() => import('@/pages/Receipt'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const About = lazy(() => import('@/pages/About'));
const Careers = lazy(() => import('@/pages/Careers'));
const Blog = lazy(() => import('@/pages/Blog'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-gray-500">
      Loading...
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="about" element={<About />} />
          <Route path="careers" element={<Careers />} />
          <Route path="blog" element={<Blog />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />

          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="saved" element={<SavedProperties />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="payment/:id" element={<Payment />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="receipt/:txRef" element={<Receipt />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route element={<ProtectedRoute allowedRoles={['host']} />}>
              <Route path="my-properties" element={<MyProperties />} />
              <Route path="properties/create" element={<CreateProperty />} />
              <Route path="properties/:id/edit" element={<EditProperty />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
