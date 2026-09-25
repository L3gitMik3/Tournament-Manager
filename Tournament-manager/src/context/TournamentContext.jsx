// src/context/TournamentContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      loadTournament(tournamentId);
    } else {
      setLoading(false);
      setError('No tournament ID provided');
    }
  }, [tournamentId]);

  const loadTournament = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Loading tournament ${id}...`);
      const response = await tournaments.get(id);
      console.log('✅ Tournament response:', response.data);
      
      // Handle different response formats
      let tournamentData = null;
      if (response.data && response.data.data) {
        tournamentData = response.data.data;
      } else if (response.data) {
        tournamentData = response.data;
      }
      
      if (tournamentData && tournamentData.id) {
        setTournament(tournamentData);
        console.log('✅ Tournament loaded:', tournamentData.name);
      } else {
        setError('Tournament not found');
        toast.error('Tournament not found');
        setTimeout(() => navigate('/my-tournaments'), 1500);
      }
    } catch (err) {
      console.error('❌ Failed to load tournament:', err);
      // Check if it's a 404
      if (err.response && err.response.status === 404) {
        setError('Tournament not found');
        toast.error('Tournament not found');
      } else {
        setError('Failed to load tournament');
        toast.error('Failed to load tournament');
      }
      setTimeout(() => navigate('/my-tournaments'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const refreshTournament = () => {
    if (tournamentId) {
      loadTournament(tournamentId);
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