import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Tv, PlusCircle, LogIn } from 'lucide-react';

interface FireTVHomeProps {
  user: User | null;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onNavigateToAuth: () => void;
}

export const FireTVHome = ({ user, onCreateRoom, onJoinRoom, onNavigateToAuth }: FireTVHomeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111184] via-[#1a1a9a] to-[#222299] grid-pattern flex flex-col items-center justify-center">
      <Card className="w-full max-w-lg bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Tv size={48} className="text-[#00e6e6]" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-[#00e6e6] to-[#00cccc] bg-clip-text text-transparent">
            FireSync Watch Party
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <p className="text-center text-gray-300 text-lg">
            Welcome to the next generation of synchronized streaming.
          </p>
          <div className="grid grid-cols-1 gap-4 pt-4">
            <Button
              onClick={onCreateRoom}
              className="w-full py-8 text-xl font-semibold bg-gradient-to-r from-[#00e6e6] to-[#00cccc] hover:from-[#00cccc] hover:to-[#009999] text-[#111184] transition-all duration-300 transform hover:scale-105 shadow-[#00e6e6]/30"
            >
              <PlusCircle className="mr-4" size={28} />
              Create New Room
            </Button>
            <Button
              onClick={onJoinRoom}
              className="w-full py-8 text-xl font-semibold bg-[#222299]/50 border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="mr-4" size={28} />
              Join Existing Room
            </Button>
          </div>
          {/* {!user && (
            <div className="text-center pt-4">
              <Button variant="link" onClick={onNavigateToAuth} className="text-gray-300 hover:text-[#00e6e6]">
                Or sign in for more features
              </Button>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}; 