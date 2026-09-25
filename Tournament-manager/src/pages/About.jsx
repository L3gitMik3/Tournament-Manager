import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Heart, ShieldCheck, Trophy } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import Loading from '../components/common/Loading';

const About = () => {
  const { tournament, tournamentId, loading } = useTournament();

  if (loading) return <Loading />;

  const name = tournament?.name || 'This tournament';
  const sport = tournament?.sport || tournament?.game || 'sport';

  return (
    <div className="bg-[#f7f8f5] text-[#18302f]">
      <section className="bg-[#e5efeb]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97757]">The story behind the scoreboard</p>
          <h1 className="mt-4 max-w-4xl font-['Space_Grotesk'] text-5xl font-bold leading-[0.98] tracking-[-0.05em] sm:text-7xl">More than a fixture.<br /><span className="text-[#d97757]">A shared arena.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">{name} brings competitors, coaches, families, and supporters together around the moments that make {sport} worth showing up for.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-8 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97757]">Our purpose</p><h2 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold tracking-tight">Make every match matter.</h2></div>
        <div className="space-y-5 text-lg leading-8 text-slate-600"><p>This public hub keeps the whole tournament easy to follow: live schedules, results, standings, and the people behind every team.</p><p>Whether you are here for one match or the whole season, the important details are always close, clear, and ready for the next whistle.</p></div>
      </section>
      <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-12 md:grid-cols-3 lg:px-8">
        {[[Trophy, 'Competition with character', 'A stage for focus, skill, and the joy of playing well.'], [ShieldCheck, 'A clear source of truth', 'Schedules and standings stay easy for everyone to trust.'], [Heart, 'Built around people', 'The best tournaments create memories long after the final score.']].map(([Icon, title, copy]) => <div key={title} className="rounded-2xl bg-[#f7f8f5] p-6"><Icon className="text-[#d97757]" size={24} /><h3 className="mt-6 font-['Space_Grotesk'] text-lg font-bold">{title}</h3><p className="mt-2 leading-7 text-slate-500">{copy}</p></div>)}
      </div></section>
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97757]">Stay close to the action</p><h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold">Ready for the next match?</h2></div><div className="flex flex-wrap gap-3"><Link to={`/t/${tournamentId}/matches`} className="inline-flex items-center gap-2 rounded-xl bg-[#113c3a] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#1b514d]">See matches <ArrowRight size={16} /></Link><Link to={`/t/${tournamentId}/gallery`} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-bold text-[#113c3a] hover:bg-white"><CalendarDays size={16} /> Visit gallery</Link></div></section>
    </div>
  );
};

export default About;