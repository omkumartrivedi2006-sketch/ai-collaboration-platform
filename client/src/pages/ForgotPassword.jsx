import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Reset link sent! Please check your inbox.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 font-extrabold uppercase tracking-widest text-sm mb-4">
          <KeyRound className="h-5 w-5" /> CollabSphere
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          Enter your email and we'll send you instructions to reset it.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border border-slate-900 bg-slate-905/30 backdrop-blur-md">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-2">
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400 mx-auto mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-white">Check your email</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                We've sent a password reset link to <strong className="text-slate-300">{email}</strong>.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6 text-slate-300 border-slate-800 hover:text-white"
                onClick={() => setSubmitted(false)}
              >
                Resend email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
