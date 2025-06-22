import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tv, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppSwitcher = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            FireSync
          </h1>
          <p>Choose your device interface</p>
        </div>
        
        <div className="space-y-4">
          <Link to="/firetv" className="block">
            <Button className="w-full p-6 text-lg">
              <Tv className="w-6 h-6 mr-3" />
              Fire TV Interface
            </Button>
          </Link>
          
          <Link to="/mobile" className="block">
            <Button className="w-full p-6 text-lg">
              <Smartphone className="w-6 h-6 mr-3" />
              Mobile Interface
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
