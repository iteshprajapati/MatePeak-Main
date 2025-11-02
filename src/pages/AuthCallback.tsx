import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    try {
      console.log('🔐 Auth Callback - Starting email confirmation');
      
      // Get the hash from URL (contains the tokens)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      console.log('🔐 Auth Callback - Type:', type);
      console.log('🔐 Access Token:', accessToken ? 'Present' : 'Missing');
      console.log('🔐 Refresh Token:', refreshToken ? 'Present' : 'Missing');

      if (type === 'signup' && accessToken) {
        // Set the session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error) {
          console.error('Session set error:', error);
          throw error;
        }

        console.log('Email confirmed for user:', data.user?.id);
        console.log('User metadata:', data.user?.user_metadata);

        // Create/update profile if user exists
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || '',
              user_type: data.user.user_metadata?.user_type || 'student',
              avatar_url: data.user.user_metadata?.avatar_url || null,
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Profile creation/update error:', profileError);
            // Don't throw - profile might already exist
          } else {
            console.log('Profile created/updated successfully');
          }
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');

        // Redirect based on user type after 2 seconds
        setTimeout(() => {
          const userType = data.user?.user_metadata?.user_type;
          console.log('🔀 Redirecting user type:', userType);
          
          if (userType === 'mentor') {
            navigate('/mentor-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 2000);

      } else if (type === 'recovery') {
        // Password recovery
        console.log('🔑 Password recovery detected');
        navigate('/reset-password');
      } else {
        throw new Error('Invalid confirmation link or missing tokens');
      }

    } catch (error: any) {
      console.error('==========================================');
      console.error('EMAIL CONFIRMATION ERROR:');
      console.error('==========================================');
      console.error('Error:', error);
      console.error('Error Message:', error?.message);
      console.error('==========================================');
      
      setStatus('error');
      setMessage(error.message || 'Failed to verify email. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3">Verifying Email</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">This may take a few moments...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-green-600">Email Verified!</h1>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Your account is now active and ready to use
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-red-600">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm text-red-800 font-semibold mb-2">Possible reasons:</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>The confirmation link has expired</li>
                <li>The link has already been used</li>
                <li>The link is invalid or corrupted</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/student/signup')}
                className="w-full h-11"
              >
                Try Signing Up Again
              </Button>
              <Button 
                onClick={() => navigate('/student/login')} 
                variant="outline"
                className="w-full h-11"
              >
                Go to Login
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost"
                className="w-full h-11"
              >
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
