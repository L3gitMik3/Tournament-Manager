import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Trophy, Images, Info, GitBranch, ArrowUpRight } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers'; // ✅ Correct helper name

const Navbar = () => {
  const { tournament } = useTournament();
  const { isAuthenticated } = useAuth();
  // ❌ Removed unused navigate

  const navLinks = [
    { icon: Calendar, label: 'Matches', path: 'matches' },
    { icon: Trophy, label: 'Standings', path: 'standings' },
    { icon: Images, label: 'Gallery', path: 'gallery' },
    { icon: GitBranch, label: 'Bracket', path: 'bracket' },
    { icon: Info, label: 'About', path: 'about' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8f5]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
          {/* Logo */}
          <Link to={`/t/${tournament?.id}`} className="group flex min-w-0 items-center gap-3">
            {tournament?.logo_url ? (
              <img 
                src={getImageUrl(tournament.logo_url, 'tournaments')} // ✅ Fixed
                alt={tournament.name} 
                className="h-11 w-11 rounded-2xl border border-slate-200 bg-white object-contain p-1.5 shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#113c3a] text-[#f5c76b] shadow-sm">
                <Trophy size={22} />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-['Space_Grotesk'] text-base font-bold tracking-tight text-[#18302f] sm:text-lg">
                {tournament?.name || 'Tournament'}
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-[#d97757] sm:block">Official tournament hub</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {tournament && navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={`/t/${tournament.id}/${link.path}`}
                className={({ isActive }) => `group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-[#e5efeb] text-[#113c3a]' : 'text-slate-500 hover:bg-white hover:text-[#113c3a]'}`}
              >
                <link.icon size={16} />
                <span className="hidden md:inline">{link.label}</span>
              </NavLink>
            ))}

            {isAuthenticated && tournament && (
              <Link
                to={`/t/${tournament.id}/admin`}
                className="ml-1 hidden items-center gap-2 rounded-xl bg-[#d97757] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#bd6147] sm:flex"
              >
                Admin <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
      </div>
    </nav>
  );
};

export default Navbar;