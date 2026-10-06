// src/context/TournamentContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { tournaments } from '../api/axios';
import { toast } from 'react-toastify';

// Create context
export const TournamentContext = createContext();

// Custom hook
export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within TournamentProvider');
  }
  return context;
};

// Provider
export const TournamentProvider = ({ children }) => {
  const { tournamentId } = useParams();
  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');
  const requestVersion = useRef(0);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      loadTournament(tournamentId, isAdminRoute);
    } else {
      requestVersion.current += 1;
      setTournament(null);
      setLoading(false);
      setError('No tournament ID provided');
    }
  }, [tournamentId, isAdminRoute]);

  const loadTournament = async (id, requireOwnership = isAdminRoute) => {
    const currentRequest = ++requestVersion.current;
    setLoading(true);
    setError(null);
    setTournament(null);
    try {
      const response = requireOwnership
        ? await tournaments.getForManagement(id)
        : await tournaments.get(id);
      if (currentRequest !== requestVersion.current) return;
      
      // Handle different response formats
      let tournamentData = null;
      if (response.data && response.data.data) {
        tournamentData = response.data.data;
      } else if (response.data) {
        tournamentData = response.data;
      }
      
      if (tournamentData && tournamentData.id) {
        setTournament(tournamentData);
      } else {
        setError('Tournament not found');
        setTournament(null);
        toast.error('Tournament not found');
      }
    } catch (err) {
      if (currentRequest !== requestVersion.current) return;
      setTournament(null);
      // Check if it's a 404
      if (err.response && err.response.status === 404) {
        setError('Tournament not found');
        toast.error('Tournament not found');
      } else {
        setError('Failed to load tournament');
        toast.error('Failed to load tournament');
      }
    } finally {
      if (currentRequest === requestVersion.current) {
        setLoading(false);
      }
    }
  };

  const refreshTournament = () => {
    if (tournamentId) {
      loadTournament(tournamentId, isAdminRoute);
    }
  };

  return (
    <TournamentContext.Provider 
      value={{ 
        tournament, 
        loading, 
        error, 
        tournamentId,
        refreshTournament,
        loadTournament 
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};