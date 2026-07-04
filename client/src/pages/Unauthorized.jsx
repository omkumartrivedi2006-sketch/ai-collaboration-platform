import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <Card className="max-w-md w-full text-center border border-slate-900 bg-slate-900/35 backdrop-blur-md py-8">
        <div className="h-14 w-14 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/25 text-rose-500 mx-auto mb-6">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Access Denied
        </h2>
        <p className="mt-3 text-xs text-slate-400 font-medium leading-relaxed px-4">
          You do not have the required role permissions to access this screen. Please contact your system administrator if you think this is a mistake.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/dashboard">
            <Button size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
