import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { lookupRoom } from '@/hooks/useRoomLookup';

export const RoomLookupTest = () => {
  const [roomCode, setRoomCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleLookup = async () => {
    if (!roomCode) return;
    
    setLoading(true);
    setError(null);
    try {
      const room = await lookupRoom(roomCode);
      setResult(room);
    } catch (err: any) {
      setError(err.message || 'Failed to look up room');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-4 max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-4">Room Lookup Test</h2>
      <div className="flex gap-2 mb-4">
        <Input 
          value={roomCode} 
          onChange={e => setRoomCode(e.target.value)} 
          placeholder="Room Code"
        />
        <Button onClick={handleLookup} disabled={loading}>
          {loading ? 'Looking up...' : 'Lookup Room'}
        </Button>
      </div>
      
      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="p-2 bg-green-100 border border-green-300 rounded">
          <h3 className="font-bold">Room Found:</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Card>
  );
};
