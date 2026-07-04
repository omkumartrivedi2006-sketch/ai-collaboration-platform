import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      designation: '',
      phone: '',
      role: 'Employee'
    }
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        department: data.department,
        designation: data.designation
      });
      toast.success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Employee', label: 'Employee' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 font-extrabold uppercase tracking-widest text-sm mb-4">
          <KeyRound className="h-5 w-5" /> CollabSphere
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="border border-slate-900 bg-slate-905/30 backdrop-blur-md">
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
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@company.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                    message: 'Must contain uppercase, lowercase, number and symbol'
                  }
                })}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === passwordVal || 'Passwords do not match'
                })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <Select
                label="Role"
                name="role"
                options={roleOptions}
                error={errors.role?.message}
                placeholder=""
                {...register('role', { required: 'Role is required' })}
              />
            </div>

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1234567890"
              error={errors.phone?.message}
              {...register('phone', {
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: 'Invalid phone number format (use E.164)'
                }
              })}
            />

            <Button type="submit" loading={loading} className="w-full mt-4">
              Register Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
