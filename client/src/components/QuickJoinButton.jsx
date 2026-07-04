import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import Button from './Button';

export const QuickJoinButton = ({ meetingId, status, size = 'sm' }) => {
  const navigate = useNavigate();
  const isJoinable = status === 'LIVE' || status === 'SCHEDULED';

  if (!isJoinable) return null;

  return (
    <Button
      size={size}
      onClick={() => navigate(`/meetings/${meetingId}/join`)}
      className="cursor-pointer bg-indigo-650 hover:bg-indigo-750 text-white font-bold inline-flex items-center gap-1.5"
    >
      <Video className="h-3.5 w-3.5" />
      <span>Join Meeting</span>
    </Button>
  );
};

export default QuickJoinButton;
