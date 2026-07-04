import React from 'react';
import Avatar from './Avatar';

const MemberAvatarGroup = ({ members = [], limit = 4 }) => {
  const visibleMembers = members.slice(0, limit);
  const extraCount = members.length - limit;

  return (
    <div className="flex -space-x-2 overflow-hidden items-center">
      {visibleMembers.map((member, index) => {
        const user = member.user || member;
        return (
          <Avatar
            key={user.id || index}
            src={user.avatar}
            name={user.name}
            size="sm"
            className="inline-block ring-2 ring-white border border-slate-100"
          />
        );
      })}
      {extraCount > 0 && (
        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white border border-slate-200">
          +{extraCount}
        </div>
      )}
      {members.length === 0 && (
        <span className="text-[10px] text-slate-400 font-semibold italic">No members</span>
      )}
    </div>
  );
};

export default MemberAvatarGroup;
