import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Backend } from '../services/apiBackend';
import { v4 as uuidv4 } from 'uuid';

export interface PageVisit {
  path: string;
  timestamp: string;
  timeSpent?: number;
}

export interface TrackingSession {
  id: string;
  userId?: string;
  ip?: string;
  deviceId: string;
  startTime: string;
  endTime?: string;
  pagesVisited: PageVisit[];
  behaviorScore?: string;
}

interface TrackingContextType {
  session: TrackingSession | null;
}

const TrackingContext = createContext<TrackingContextType>({ session: null });

export const useTracking = () => useContext(TrackingContext);

export const TrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [session, setSession] = useState<TrackingSession | null>(null);
  
  // Ref to hold the mutable session data without triggering re-renders continuously
  const sessionRef = useRef<TrackingSession | null>(null);
  const lastPathRef = useRef<string>('');
  const lastPathTimeRef = useRef<number>(Date.now());
  const deviceIdRef = useRef<string>('');

  useEffect(() => {
    // Initialize session
    let deviceId = localStorage.getItem('nhfg_device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('nhfg_device_id', deviceId);
    }
    deviceIdRef.current = deviceId;

    const newSession: TrackingSession = {
      id: uuidv4(),
      deviceId,
      startTime: new Date().toISOString(),
      pagesVisited: []
    };
    
    // Check if user is logged in
    const userId = localStorage.getItem('nhfg_user_id');
    if (userId) {
      newSession.userId = userId;
    }

    sessionRef.current = newSession;
    setSession(newSession);

    // Set up 15-minute flush interval (or when closing)
    const interval = setInterval(() => {
      flushSession();
    }, 15 * 60 * 1000); // 15 mins

    const handleBeforeUnload = () => {
      flushSession(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!sessionRef.current) return;
    const now = Date.now();
    const currentPath = location.pathname + location.search;

    if (lastPathRef.current) {
      // Calculate time spent on previous path
      const timeSpent = Math.floor((now - lastPathTimeRef.current) / 1000);
      
      const lastVisit = sessionRef.current.pagesVisited.find(v => v.path === lastPathRef.current);
      if (lastVisit) {
        lastVisit.timeSpent = (lastVisit.timeSpent || 0) + timeSpent;
      }
    }

    // Add new visit
    sessionRef.current.pagesVisited.push({
      path: currentPath,
      timestamp: new Date().toISOString(),
      timeSpent: 0
    });

    lastPathRef.current = currentPath;
    lastPathTimeRef.current = now;

    // Persist partially if needed
    // Backend.saveTrackingSession(sessionRef.current);
  }, [location.pathname, location.search]);

  const flushSession = (isUnload = false) => {
    if (!sessionRef.current) return;
    const now = Date.now();
    
    // Finalize time on current path
    if (lastPathRef.current) {
      const timeSpent = Math.floor((now - lastPathTimeRef.current) / 1000);
      const lastVisit = sessionRef.current.pagesVisited.find(v => v.path === lastPathRef.current);
      if (lastVisit) {
        lastVisit.timeSpent = (lastVisit.timeSpent || 0) + timeSpent;
      }
      lastPathTimeRef.current = now; // reset
    }

    sessionRef.current.endTime = new Date().toISOString();
    
    // Calculate behavior score
    let score = 'Low Intent';
    const totalTime = sessionRef.current.pagesVisited.reduce((acc, v) => acc + (v.timeSpent || 0), 0);
    if (totalTime > 300) score = 'High Intent';
    else if (totalTime > 60) score = 'Medium Intent';
    sessionRef.current.behaviorScore = score;

    setSession({ ...sessionRef.current });

    // Send to backend
    if (isUnload) {
      // Use navigator.sendBeacon if possible
      const url = '/api/tracking';
      const data = JSON.stringify(sessionRef.current);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, data);
      } else {
        fetch(url, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: data });
      }
    } else {
      fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionRef.current)
      }).catch(console.error);
    }
  };

  return (
    <TrackingContext.Provider value={{ session }}>
      {children}
    </TrackingContext.Provider>
  );
};
