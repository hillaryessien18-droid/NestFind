import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import CreateProperty from '@/pages/CreateProperty';
import EditProperty from '@/pages/EditProperty';
import Dashboard from '@/pages/Dashboard';
import MyProperties from '@/pages/MyProperties';
import SavedProperties from '@/pages/SavedProperties';
import Enquiries from '@/pages/Enquiries';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:id" element={<PropertyDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="saved" element={<SavedProperties />} />
          <Route path="enquiries" element={<Enquiries />} />

          <Route element={<ProtectedRoute allowedRoles={['host']} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="properties/create" element={<CreateProperty />} />
            <Route path="properties/:id/edit" element={<EditProperty />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
