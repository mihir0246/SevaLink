import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Admin from './pages/Admin';
import AdminVolunteers from './pages/AdminVolunteers';
import SurveyUpload from './pages/SurveyUpload';
import SurveyExtraction from './pages/SurveyExtraction';
import Needs from './pages/Needs';
import Reports from './pages/Reports';
import SmartAssign from './pages/SmartAssign';
import VolunteerTaskList from './pages/VolunteerTaskList';
import MyTasks from './pages/MyTasks';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import ManualNeedEntry from './pages/ManualNeedEntry';

function ProtectedRoute({ children, requiredRole }: { children: JSX.Element; requiredRole?: 'admin' | 'volunteer' }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/volunteer/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/admin/surveys" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><SurveyUpload /></Layout></ProtectedRoute>} />
          <Route path="/admin/surveys/extract" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><SurveyExtraction /></Layout></ProtectedRoute>} />
          <Route path="/admin/surveys/manual" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><ManualNeedEntry /></Layout></ProtectedRoute>} />
          <Route path="/admin/needs" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><Needs /></Layout></ProtectedRoute>} />
          <Route path="/admin/volunteers" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><AdminVolunteers /></Layout></ProtectedRoute>} />
          <Route path="/admin/map" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><MapView /></Layout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><Reports /></Layout></ProtectedRoute>} />
          <Route path="/admin/smart-assign" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><SmartAssign /></Layout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><Layout userRole="admin"><Admin /></Layout></ProtectedRoute>} />

          {/* Volunteer Routes */}
          <Route path="/volunteer/dashboard" element={<ProtectedRoute requiredRole="volunteer"><Layout userRole="volunteer"><VolunteerDashboard /></Layout></ProtectedRoute>} />
          <Route path="/volunteer/available-tasks" element={<ProtectedRoute requiredRole="volunteer"><Layout userRole="volunteer"><VolunteerTaskList /></Layout></ProtectedRoute>} />
          <Route path="/volunteer/my-tasks" element={<ProtectedRoute requiredRole="volunteer"><Layout userRole="volunteer"><MyTasks /></Layout></ProtectedRoute>} />
          <Route path="/volunteer/map" element={<ProtectedRoute requiredRole="volunteer"><Layout userRole="volunteer"><MapView /></Layout></ProtectedRoute>} />
          <Route path="/volunteer/profile" element={<ProtectedRoute requiredRole="volunteer"><Layout userRole="volunteer"><VolunteerDashboard /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </LanguageProvider>
  );
}