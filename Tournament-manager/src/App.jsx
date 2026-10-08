// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import PublicLayout from './components/Layout/PublicLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Platform Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTournaments from './pages/MyTournaments';
import CreateTournament from './pages/CreateTournament';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import Gallery from './pages/Gallery';
import Bracket from './pages/Bracket';

// Admin Pages
import Dashboard from './pages/Dashboard';
import ManageMatches from './pages/ManageMatches';
import ManageTeams from './pages/ManageTeams';
import ManageCategories from './pages/ManageCategories';
import ManageGallery from './pages/ManageGallery';
import Settings from './pages/Settings';
import AdminGuide from './pages/AdminGuide';

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Platform Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Platform Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-tournaments" element={<MyTournaments />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
        </Route>

        {/* ============================================
            TOURNAMENT ROUTES
            ============================================ */}

        {/* Public Tournament Routes */}
        <Route path="/t/:tournamentId" element={<TournamentProvider><PublicLayout><Home /></PublicLayout></TournamentProvider>} />
        <Route path="/t/:tournamentId/about" element={<TournamentProvider><PublicLayout><About /></PublicLayout></TournamentProvider>} />
        <Route path="/t/:tournamentId/matches" element={<TournamentProvider><PublicLayout><Matches /></PublicLayout></TournamentProvider>} />
        <Route path="/t/:tournamentId/standings" element={<TournamentProvider><PublicLayout><Standings /></PublicLayout></TournamentProvider>} />
        <Route path="/t/:tournamentId/gallery" element={<TournamentProvider><PublicLayout><Gallery /></PublicLayout></TournamentProvider>} />
        <Route path="/t/:tournamentId/bracket" element={<TournamentProvider><PublicLayout><Bracket /></PublicLayout></TournamentProvider>} />

        {/* Protected Admin Tournament Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/t/:tournamentId/admin" element={<TournamentProvider><AdminLayout><Dashboard /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/matches" element={<TournamentProvider><AdminLayout><ManageMatches /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/teams" element={<TournamentProvider><AdminLayout><ManageTeams /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/categories" element={<TournamentProvider><AdminLayout><ManageCategories /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/gallery" element={<TournamentProvider><AdminLayout><ManageGallery /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/settings" element={<TournamentProvider><AdminLayout><Settings /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/guide" element={<TournamentProvider><AdminLayout><AdminGuide /></AdminLayout></TournamentProvider>} />
          <Route path="/t/:tournamentId/admin/bracket" element={<TournamentProvider><AdminLayout><Bracket admin /></AdminLayout></TournamentProvider>} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;