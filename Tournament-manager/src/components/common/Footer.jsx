import React from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { Trophy } from 'lucide-react';

const Footer = () => {
  const { tournament } = useTournament();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-[#113c3a] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 lg:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to={`/t/${tournament?.id}`} className="flex items-center gap-2 font-['Space_Grotesk'] text-lg font-bold">
            <Trophy className="text-[#f5c76b]" size={20} />
            {tournament?.name || 'Tournament Platform'}
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-teal-100/70">The official home for fixtures, standings, teams, and tournament moments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-teal-100/70">
          <Link to={`/t/${tournament?.id}/matches`} className="transition hover:text-white">Matches</Link>
          <Link to={`/t/${tournament?.id}/standings`} className="transition hover:text-white">Standings</Link>
          <Link to={`/t/${tournament?.id}/about`} className="transition hover:text-white">About</Link>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;