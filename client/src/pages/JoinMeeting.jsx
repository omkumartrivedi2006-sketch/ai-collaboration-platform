import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useMeetings } from '../context/MeetingContext';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { VideoOff, MicOff, Maximize2, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const JoinMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeMeeting, fetchMeetingDetails, joinMeeting, leaveMeeting } = useMeetings();

  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [jitsiApiInstance, setJitsiApiInstance] = useState(null);
  const [error, setError] = useState(null);
  
  const jitsiContainerRef = useRef(null);

  // Dynamic script loader for Jitsi External API
  useEffect(() => {
    const existingScript = document.getElementById('jitsi-external-api');
    if (existingScript) {
      setJitsiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'jitsi-external-api';
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setJitsiLoaded(true);
    script.onerror = () => {
      setError('Failed to load Jitsi Video SDK. Check internet connectivity.');
      toast.error('Failed to load Jitsi Meet library');
    };
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('jitsi-external-api');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  useEffect(() => {
    fetchMeetingDetails(id).catch(err => {
      setError('You are not authorized to join this meeting room.');
    });
  }, [id, fetchMeetingDetails]);

  // Initializing Jitsi Meet
  useEffect(() => {
    if (jitsiLoaded && activeMeeting && !jitsiApiInstance && jitsiContainerRef.current) {
      // Record joining action in database
      joinMeeting(id).catch(e => {
        console.error('Failed to record participant join state:', e);
      });

      try {
        const domain = 'meet.jit.si';
        // Extract room name from meet.jit.si URL
        const parsedUrl = new URL(activeMeeting.meetingLink);
        const roomName = parsedUrl.pathname.substring(1);

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.name || 'Collaborator',
            email: user?.email || ''
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false
          }
        };

        const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        setJitsiApiInstance(apiInstance);

        const handleUnload = () => {
          leaveMeeting(id);
          apiInstance.dispose();
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
          window.removeEventListener('beforeunload', handleUnload);
          leaveMeeting(id);
          apiInstance.dispose();
        };
      } catch (err) {
        console.error('Jitsi initialization failure:', err);
        setError('Failed to initialize the video conference frame.');
      }
    }
  }, [jitsiLoaded, activeMeeting, user, id, joinMeeting, leaveMeeting, jitsiApiInstance]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 font-sans text-xs">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h3 className="text-sm font-bold text-slate-800">Connection Blocked</h3>
        <p className="text-slate-450 font-semibold text-center max-w-sm">{error}</p>
        <Button size="sm" onClick={() => navigate('/meetings')} className="cursor-pointer">
          Return to Planner
        </Button>
      </div>
    );
  }

  if (!activeMeeting || !jitsiLoaded) {
    return <Loader size="lg" message="Connecting to secure meeting space..." fullPage />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-sans text-xs">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/meetings/${activeMeeting.id}`)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Leave Conference and return to details"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-slate-500" />
          </button>
          <div>
            <h3 className="font-bold text-slate-800 text-xs truncate max-w-[200px] sm:max-w-md">{activeMeeting.title}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              Secure Live Session
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              if (jitsiApiInstance) {
                leaveMeeting(activeMeeting.id);
                jitsiApiInstance.dispose();
                navigate(`/meetings/${activeMeeting.id}`);
              }
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            Hang Up
          </button>
        </div>
      </div>

      {/* Main conference frame */}
      <div className="flex-1 bg-slate-900 relative">
        <div ref={jitsiContainerRef} className="w-full h-full" id="jitsi-iframe-container" />
      </div>

    </div>
  );
};

export default JoinMeeting;
