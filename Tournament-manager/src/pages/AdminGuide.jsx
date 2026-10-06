import React from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const AdminGuide = () => {
  const { tournamentId, tournament } = useTournament();
  const adminPath = `/t/${tournamentId}/admin`;

  const steps = [
    {
      number: '01',
      title: 'Set up your tournament',
      description: 'Add a clear name, season, slogan, and logo. Keep the status in Setup while you prepare.',
      link: `${adminPath}/settings`,
      linkLabel: 'Open settings',
    },
    {
      number: '02',
      title: 'Create categories',
      description: 'Add a category for each division or age group and choose the number of teams per group.',
      link: `${adminPath}/categories`,
      linkLabel: 'Manage categories',
    },
    {
      number: '03',
      title: 'Add teams and assign pools',
      description: 'Add each team under the right category. Assign pool or group names consistently so fixtures can be generated correctly.',
      link: `${adminPath}/teams`,
      linkLabel: 'Manage teams',
    },
    {
      number: '04',
      title: 'Schedule matches',
      description: 'Generate missing round-robin fixtures for a category, or create matches yourself. Add the date, time, and venue where known.',
      link: `${adminPath}/matches`,
      linkLabel: 'Manage matches',
    },
    {
      number: '05',
      title: 'Run the competition',
      description: 'Record scores as matches finish. Set up knockout matches and connect each match to its next match to track progression through the bracket.',
      link: `${adminPath}/bracket`,
      linkLabel: 'View bracket',
    },
    {
      number: '06',
      title: 'Publish and keep it current',
      description: 'Switch the tournament status to Active, share the public link, and add photos to the gallery. Update results promptly so visitors see the latest standings and bracket.',
      link: `${adminPath}/settings`,
      linkLabel: 'Share tournament',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Admin guide</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Host your tournament from scratch</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Use this checklist to prepare {tournament?.name || 'your tournament'}, run matches, and share updates with participants.
          </p>
        </header>

        <ol className="divide-y divide-gray-200 border-y border-gray-200 bg-white">
          {steps.map((step) => (
            <li key={step.number} className="grid gap-4 px-5 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:px-6">
              <span className="text-sm font-bold tabular-nums text-blue-700">{step.number}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">{step.description}</p>
              </div>
              <Link
                to={step.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 sm:mt-1"
              >
                {step.linkLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-start gap-3 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <p>Before kickoff, check that every team is in the right category and pool, match times and venues are correct, and your public link opens as expected.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminGuide;