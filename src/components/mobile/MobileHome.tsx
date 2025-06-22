import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tv, Smartphone, Users, LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileHomeProps {
  user: SupabaseUser | null;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSignOut: () => void;
}

export const MobileHome = ({ user, onCreateRoom, onJoinRoom, onSignOut }: MobileHomeProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            FireSync
          </h1>
          <p>Mobile Remote Control</p>
          {user && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full p-6 text-lg"
            onClick={onCreateRoom}
          >
            <Tv className="w-6 h-6 mr-3" />
            Host Watch Party
          </Button>
          
          <Button 
            className="w-full p-6 text-lg"
            onClick={onJoinRoom}
          >
            <Smartphone className="w-6 h-6 mr-3" />
            Join Party
          </Button>

          {!user && (
            <div className="rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Sign In Required</span>
              </div>
              <p className="text-sm">
                Create an account to host watch parties or join existing ones with your family.
              </p>
            </div>
          )}

          {user && (
            <Button 
              variant="outline"
              className="w-full mt-6"
              onClick={onSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
