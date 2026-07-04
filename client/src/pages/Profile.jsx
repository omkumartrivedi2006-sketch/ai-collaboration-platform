import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
      designation: user?.designation || '',
      avatar: user?.avatar || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
        Account Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="text-center py-8">
            <Avatar src={user?.avatar} name={user?.name} size="xl" className="mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 mt-4 leading-none">
              {user?.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-1.5">
              {user?.role} • {user?.department || 'General'}
            </p>
            <p className="text-xs text-slate-500 mt-4 break-all">
              {user?.email}
            </p>
            <div className="h-px bg-slate-100 my-5" />
            <div className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">
              Last Login <br />
              <span className="text-slate-600 font-bold normal-case text-xs inline-block mt-1">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First Session'}
              </span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Profile Details" subtitle="Update your personal workspace metadata">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  placeholder="+1234567890"
                  error={errors.phone?.message}
                  {...register('phone', {
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number format (use E.164)'
                    }
                  })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Department"
                  name="department"
                  placeholder="Engineering"
                  error={errors.department?.message}
                  {...register('department')}
                />

                <Input
                  label="Designation"
                  name="designation"
                  placeholder="Software Engineer"
                  error={errors.designation?.message}
                  {...register('designation')}
                />
              </div>

              <Input
                label="Avatar URL"
                name="avatar"
                placeholder="https://example.com/avatar.svg"
                error={errors.avatar?.message}
                {...register('avatar')}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
