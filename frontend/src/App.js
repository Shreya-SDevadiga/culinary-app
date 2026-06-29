import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import RecipesPage from './pages/public/RecipesPage';
import RecipeDetailPage from './pages/public/RecipeDetailPage';
import AboutPage from './pages/public/AboutPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import SubmitRecipePage from './pages/user/SubmitRecipePage';
import MyRecipesPage from './pages/user/MyRecipesPage';
import EditRecipePage from './pages/user/EditRecipePage';
import ProfilePage from './pages/user/ProfilePage';
import BookmarksPage from './pages/user/BookmarksPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRecipes from './pages/admin/AdminRecipes';
import AdminPendingApprovals from './pages/admin/AdminPendingApprovals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminComments from './pages/admin/AdminComments';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-orange-50">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">{children}</div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
      <Route path="/recipes" element={<AppLayout><RecipesPage /></AppLayout>} />
      <Route path="/recipes/:id" element={<AppLayout><RecipeDetailPage /></AppLayout>} />
      <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />

      {/* Auth Routes */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/admin/login" element={<PublicOnlyRoute><AdminLoginPage /></PublicOnlyRoute>} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/submit-recipe" element={<ProtectedRoute><AppLayout><SubmitRecipePage /></AppLayout></ProtectedRoute>} />
      <Route path="/my-recipes" element={<ProtectedRoute><AppLayout><MyRecipesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/edit-recipe/:id" element={<ProtectedRoute><AppLayout><EditRecipePage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><AppLayout><BookmarksPage /></AppLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/recipes" element={<ProtectedRoute adminOnly><AdminLayout><AdminRecipes /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/pending" element={<ProtectedRoute adminOnly><AdminLayout><AdminPendingApprovals /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/comments" element={<ProtectedRoute adminOnly><AdminLayout><AdminComments /></AdminLayout></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            success: { style: { background: '#f97316', color: 'white' } },
            error: { style: { background: '#ef4444', color: 'white' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
