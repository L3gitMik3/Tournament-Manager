import React, { useEffect, useState } from 'react';
import { RefreshCw, RotateCcw, Trophy, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { categories } from '../api/axios';
import Loading from '../components/common/Loading';
import Button from '../components/ui/Button';

const MatchCard = ({ match }) => (
  <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
      <span>Match #{match.id}</span>
      <span className={match.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}>{match.status}</span>
    </div>
    <div className={`flex items-center justify-between border-b border-slate-100 py-2 ${match.winner_id === match.team_1_id ? 'font-bold text-[#113c3a]' : 'text-slate-600'}`}>
      <span className="flex items-center gap-2">
        {match.team_1_seed && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{match.team_1_seed}</span>}
        {match.team_1_name || 'TBD'}
      </span>
      <span>{match.status === 'completed' ? match.team_1_score : '-'}</span>
    </div>
    <div className={`flex items-center justify-between py-2 ${match.winner_id === match.team_2_id ? 'font-bold text-[#113c3a]' : 'text-slate-600'}`}>
      <span className="flex items-center gap-2">
        {match.team_2_seed && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{match.team_2_seed}</span>}
        {match.team_2_name || 'TBD'}
      </span>
      <span>{match.status === 'completed' ? match.team_2_score : '-'}</span>
    </div>
    {match.venue && <p className="mt-3 text-xs text-slate-400">{match.venue}</p>}
  </div>
);

const Bracket = ({ admin = false }) => {
  const { tournamentId, tournament, loading: tournamentLoading } = useTournament();
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [bracket, setBracket] = useState(null);
  const [qualifiers, setQualifiers] = useState(2);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');

  const loadCategories = async () => {
    const response = await categories.get(tournamentId);
    const list = response.data.data || [];
    setCategoriesData(list);
    if (!categoryId && list[0]) setCategoryId(String(list[0].id));
  };

  const loadBracket = async (id = categoryId) => {
    if (!id) {
      setBracket(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await categories.getBracket(id);
      setBracket(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) setBracket(null);
      else setMessage(error.response?.data?.error || 'Unable to load bracket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) loadCategories().catch(() => setMessage('Unable to load categories'));
  }, [tournamentId]);

  useEffect(() => {
    if (categoryId) loadBracket(categoryId);
  }, [categoryId]);

  const generate = async () => {
    setWorking(true);
    setMessage('');
    try {
      await categories.generateBracket(categoryId, Number(qualifiers));
      await loadBracket(categoryId);
      setMessage('Bracket generated from the current standings.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to generate bracket');
    } finally {
      setWorking(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Reset this knockout bracket? Group-stage matches will remain unchanged.')) return;
    setWorking(true);
    setMessage('');
    try {
      await categories.resetBracket(categoryId);
      setBracket(null);
      setMessage('Knockout bracket reset.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to reset bracket');
    } finally {
      setWorking(false);
    }
  };

  if (tournamentLoading || loading) return <Loading />;

  const rounds = bracket?.rounds || {};
  const roundOrder = ['Round of 128', 'Round of 64', 'Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', '3rd Place', 'Final'];
  const roundEntries = Object.entries(rounds).sort(([left], [right]) => {
    const leftIndex = roundOrder.indexOf(left);
    const rightIndex = roundOrder.indexOf(right);
    if (leftIndex >= 0 || rightIndex >= 0) {
      return (leftIndex < 0 ? roundOrder.length : leftIndex) - (rightIndex < 0 ? roundOrder.length : rightIndex);
    }
    const leftSize = Number(left.match(/Round of (\d+)/)?.[1] || 0);
    const rightSize = Number(right.match(/Round of (\d+)/)?.[1] || 0);
    return rightSize - leftSize || left.localeCompare(right);
  });

  return (
    <div className="min-h-screen bg-[#f7f8f5] px-5 py-10 text-[#18302f] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97757]">{tournament?.name || 'Tournament'} · progression</p>
            <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold tracking-tight sm:text-5xl">Knockout bracket</h1>
            <p className="mt-3 max-w-2xl text-slate-500">Follow every qualification, matchup, and winner as the tournament moves toward the final.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">
              <option value="">Select category</option>
              {categoriesData.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <Button variant="outline" onClick={() => loadBracket()} disabled={!categoryId || working}><RefreshCw size={16} /></Button>
          </div>
        </div>

        {admin && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#cfe1db] bg-[#eaf3ef] p-5 md:flex-row md:items-end md:justify-between">
            <div><p className="font-bold">Admin bracket controls</p><p className="mt-1 text-sm text-slate-600">Generate from the latest group standings, or reset before knockout results are recorded.</p></div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm font-semibold">Qualifiers per group<input type="number" min="1" max="8" value={qualifiers} onChange={(event) => setQualifiers(event.target.value)} className="mt-1 block w-24 rounded-lg border border-slate-300 px-3 py-2" /></label>
              <Button onClick={generate} disabled={!categoryId || working}><Trophy size={16} /> Generate</Button>
              <Button variant="outline" onClick={reset} disabled={!categoryId || working || !bracket}><RotateCcw size={16} /> Reset</Button>
            </div>
          </div>
        )}

        {message && <div className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{message}</div>}

        {!bracket || !roundEntries.length ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Users className="mx-auto text-slate-300" size={42} /><h2 className="mt-4 font-['Space_Grotesk'] text-2xl font-bold">No bracket published yet</h2><p className="mx-auto mt-2 max-w-md text-slate-500">The administrator will publish the knockout stage after group standings are ready.</p></div>
        ) : (
          <div className="mt-10 overflow-x-auto pb-6"><div className="flex min-w-max items-start gap-5">
            {roundEntries.map(([round, matches]) => <section key={round} className="w-[270px]"><div className="mb-4 flex items-center justify-between"><h2 className="font-['Space_Grotesk'] text-lg font-bold">{round}</h2><span className="text-xs font-bold text-slate-400">{matches.length} matches</span></div><div className="space-y-5">{matches.map((match) => <MatchCard key={match.id} match={match} />)}</div></section>)}
          </div></div>
        )}
      </div>
    </div>
  );
};

export default Bracket;
