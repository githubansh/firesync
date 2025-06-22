import { useState, useEffect } from 'react';
import { CreateRoom } from '@/components/CreateRoom';
import { JoinRoom } from '@/components/JoinRoom';
import { AuthPage } from '@/components/AuthPage';
import { MobileHome } from './MobileHome';
import { MobilePartyRoom } from './MobilePartyRoom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const FireTVApp = () => {
  const [currentView, setCurrentView] = useState<'home' | 'auth' | 'create' | 'join' | 'room'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // No longer redirecting users based on authentication status
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateRoom = () => {
    // No auth check - allow anyone to create a room
    setCurrentView('create');
  };

  const handleJoinRoom = () => {
    // No auth check - allow anyone to join a room
    setCurrentView('join');
  };

  const handleRoomCreated = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('room');
  };

  const handleRoomJoined = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setCurrentView('home');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentView('home');
    setCurrentRoomId(null);
  };

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen">
        <AuthPage 
          onBack={() => setCurrentView('home')}
          onAuthenticated={() => setCurrentView('home')}
        />
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen">
        <CreateRoom 
          onRoomCreated={handleRoomCreated}
          onBack={() => setCurrentView('home')}
        />
      </div>
    );
  }

  if (currentView === 'join') {
    return (
      <div className="min-h-screen">
        <JoinRoom 
          onRoomJoined={handleRoomJoined}
          onBack={() => setCurrentView('home')}
        />
      </div>
    );
  }

  if (currentView === 'room' && currentRoomId) {
    return (
      <div className="min-h-screen">
        <MobilePartyRoom 
          roomId={currentRoomId}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileHome 
        user={user}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onSignOut={handleSignOut}
      />
    </div>
  );
};
