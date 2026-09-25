import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Trophy, Users, Sparkles } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import Loading from '../components/common/Loading';
import { getImageUrl } from '../utils/helpers';

const formatTournamentDate = (value) => {
	if (!value) return 'Schedule coming soon';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export default function Home() {
	const { tournament, tournamentId, loading } = useTournament();

	if (loading) return <Loading />;

	const name = tournament?.name || 'The Championship';
	const sport = tournament?.sport || tournament?.game || 'Tournament';
	const date = tournament?.start_date || tournament?.date || tournament?.tournament_date;
	const location = tournament?.location || tournament?.venue || 'Venue to be announced';
	const teamCount = tournament?.team_count || tournament?.teams_count || tournament?.teams;
	const status = tournament?.status || 'Live season';

	return (
		<div className="overflow-hidden bg-[#f7f8f5] text-[#18302f]">
			<section className="relative isolate bg-[#113c3a]">
				<div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: 'radial-gradient(#f5c76b 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
				<div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-24">
					<div className="max-w-3xl">
						<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f5c76b]">
							<Sparkles size={14} /> {sport} · {status}
						</div>
						<h1 className="max-w-4xl font-['Space_Grotesk'] text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">{name}</h1>
						<p className="mt-7 max-w-xl text-lg leading-8 text-teal-50/75">Follow every fixture, result, and turning point from one official tournament home.</p>
						<div className="mt-9 flex flex-wrap gap-3">
							<Link to={`/t/${tournamentId}/matches`} className="inline-flex items-center gap-2 rounded-xl bg-[#f5c76b] px-5 py-3.5 text-sm font-bold text-[#18302f] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#ffd783]">
								Explore matches <ArrowRight size={17} />
							</Link>
							<Link to={`/t/${tournamentId}/standings`} className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
								View standings
							</Link>
						</div>
					</div>
					<div className="relative hidden lg:block">
						<div className="absolute -inset-4 rounded-[2rem] border border-[#f5c76b]/20 rotate-3" />
						<div className="relative rounded-[2rem] bg-[#1b514d] p-8 shadow-2xl">
							{tournament?.logo_url ? (
								<img src={getImageUrl(tournament.logo_url, 'tournaments')} alt="" className="mx-auto h-44 w-44 rounded-[2rem] bg-white object-contain p-5" />
							) : (
								<div className="mx-auto grid h-44 w-44 place-items-center rounded-[2rem] bg-[#f5c76b] text-[#113c3a]"><Trophy size={82} strokeWidth={1.4} /></div>
							)}
							<div className="mt-8 grid grid-cols-2 gap-3">
								<div className="rounded-2xl bg-black/15 p-4"><p className="text-xs uppercase tracking-widest text-teal-100/60">Format</p><p className="mt-2 font-bold text-white">{sport}</p></div>
								<div className="rounded-2xl bg-black/15 p-4"><p className="text-xs uppercase tracking-widest text-teal-100/60">Teams</p><p className="mt-2 font-bold text-white">{teamCount || 'Open field'}</p></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
				<div className="grid gap-3 md:grid-cols-3">
					<div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CalendarDays className="text-[#d97757]" /><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">When</p><p className="mt-1 font-bold">{formatTournamentDate(date)}</p></div></div>
					<div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><MapPin className="text-[#d97757]" /><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Where</p><p className="mt-1 font-bold">{location}</p></div></div>
					<div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Users className="text-[#d97757]" /><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">The field</p><p className="mt-1 font-bold">{teamCount ? `${teamCount} teams competing` : 'Teams competing this season'}</p></div></div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8">
				<div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97757]">Your tournament desk</p><h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tracking-tight sm:text-4xl">Everything in one place.</h2></div><Link to={`/t/${tournamentId}/about`} className="hidden items-center gap-2 text-sm font-bold text-[#113c3a] sm:flex">About the event <ArrowRight size={16} /></Link></div>
				<div className="grid gap-4 md:grid-cols-3">
					{[['Matches', 'See fixtures, venues, times, and results.', '/matches', CalendarDays], ['Standings', 'Track every point as the competition unfolds.', '/standings', Trophy], ['Gallery', 'Relive the atmosphere beyond the final whistle.', '/gallery', Sparkles]].map(([title, description, path, Icon]) => (
						<Link key={title} to={`/t/${tournamentId}${path}`} className="group rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#d97757]/40 hover:shadow-xl">
							<div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e5efeb] text-[#113c3a]"><Icon size={20} /></span><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#d97757]" size={20} /></div>
							<h3 className="mt-8 font-['Space_Grotesk'] text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-slate-500">{description}</p>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
