import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Tasks from './pages/Tasks';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Matchmaking from './pages/Matchmaking';
import Admin from './pages/Admin';
import AdminVolunteers from './pages/AdminVolunteers';
import SurveyUpload from './pages/SurveyUpload';
import SurveyExtraction from './pages/SurveyExtraction';
import Needs from './pages/Needs';
import Reports from './pages/Reports.tsx';
import SmartAssign from './pages/SmartAssign';
import VolunteerTaskList from './pages/VolunteerTaskList';
import MyTasks from './pages/MyTasks';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import ManualNeedEntry from './pages/ManualNeedEntry';

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
          <Route path="/admin/dashboard" element={<Layout userRole="admin"><Dashboard /></Layout>} />
          <Route path="/admin/surveys" element={<Layout userRole="admin"><SurveyUpload /></Layout>} />
          <Route path="/admin/surveys/extract" element={<Layout userRole="admin"><SurveyExtraction /></Layout>} />
          <Route path="/admin/surveys/manual" element={<Layout userRole="admin"><ManualNeedEntry /></Layout>} />
          <Route path="/admin/needs" element={<Layout userRole="admin"><Needs /></Layout>} />
          <Route path="/admin/volunteers" element={<Layout userRole="admin"><AdminVolunteers /></Layout>} />
          <Route path="/admin/map" element={<Layout userRole="admin"><MapView /></Layout>} />
          <Route path="/admin/reports" element={<Layout userRole="admin"><Reports /></Layout>} />
          <Route path="/admin/smart-assign" element={<Layout userRole="admin"><SmartAssign /></Layout>} />
          <Route path="/admin/settings" element={<Layout userRole="admin"><Admin /></Layout>} />

          {/* Volunteer Routes */}
          <Route path="/volunteer/dashboard" element={<Layout userRole="volunteer"><VolunteerDashboard /></Layout>} />
          <Route path="/volunteer/available-tasks" element={<Layout userRole="volunteer"><VolunteerTaskList /></Layout>} />
          <Route path="/volunteer/my-tasks" element={<Layout userRole="volunteer"><MyTasks /></Layout>} />
          <Route path="/volunteer/map" element={<Layout userRole="volunteer"><MapView /></Layout>} />
          <Route path="/volunteer/profile" element={<Layout userRole="volunteer"><VolunteerDashboard /></Layout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </LanguageProvider>
  );
}