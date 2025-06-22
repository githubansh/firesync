import { supabase } from '@/integrations/supabase/client';

export const lookupRoom = async (roomCode: string) => {
  try {
    console.log('Looking up room with code:', roomCode);
    
    // Try direct query with filter
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*');
    
    console.log('All rooms query result:', { rooms, error });
    
    if (error) {
      console.error('Room lookup failed:', error);
      throw error;
    }
    
    // Filter in code if database filtering fails
    const foundRoom = rooms?.find(r => 
      r.code.toUpperCase() === roomCode.toUpperCase() && 
      (r.status === 'waiting' || r.status === 'active')
    );
    
    console.log('Found room:', foundRoom);
    return foundRoom;
  } catch (error) {
    console.error('Room lookup error:', error);
    throw error;
  }
};
