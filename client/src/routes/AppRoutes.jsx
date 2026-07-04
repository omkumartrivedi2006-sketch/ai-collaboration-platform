import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Team from '../pages/Team';
import AdminPanel from '../pages/AdminPanel';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

import ProjectsList from '../pages/ProjectsList';
import CreateProject from '../pages/CreateProject';
import EditProject from '../pages/EditProject';
import ProjectDetails from '../pages/ProjectDetails';

import TaskBoard from '../pages/TaskBoard';
import TaskList from '../pages/TaskList';
import TaskDetails from '../pages/TaskDetails';
import CreateTask from '../pages/CreateTask';
import EditTask from '../pages/EditTask';

import ChatDashboard from '../pages/ChatDashboard';
import NotificationCenter from '../pages/NotificationCenter';
import FilesDashboard from '../pages/FilesDashboard';
import ProjectFiles from '../pages/ProjectFiles';
import MeetingsDashboard from '../pages/MeetingsDashboard';
import MeetingDetails from '../pages/MeetingDetails';
import JoinMeeting from '../pages/JoinMeeting';
import CalendarView from '../pages/CalendarView';

import ProtectedRoute from '../components/ProtectedRoute';
import RoleGuard from '../components/RoleGuard';
import DashboardLayout from '../layouts/DashboardLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Projects routes */}
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route
          path="projects/create"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager']}>
              <CreateProject />
            </RoleGuard>
          }
        />
        <Route
          path="projects/edit/:id"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager']}>
              <EditProject />
            </RoleGuard>
          }
        />

        {/* Tasks routes */}
        <Route path="tasks" element={<TaskBoard />} />
        <Route path="tasks/list" element={<TaskList />} />
        <Route path="tasks/:id" element={<TaskDetails />} />
        <Route
          path="tasks/create"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager']}>
              <CreateTask />
            </RoleGuard>
          }
        />
        <Route
          path="tasks/edit/:id"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager']}>
              <EditTask />
            </RoleGuard>
          }
        />

        {/* Chat and Notifications routes */}
        <Route path="chat" element={<ChatDashboard />} />
        <Route path="notifications" element={<NotificationCenter />} />
        
        {/* Files & Document Management routes */}
        <Route path="files" element={<FilesDashboard />} />
        <Route path="projects/:id/files" element={<ProjectFiles />} />
        
        {/* Meetings & Video Conferencing routes */}
        <Route path="meetings" element={<MeetingsDashboard />} />
        <Route path="meetings/calendar" element={<CalendarView />} />
        <Route path="meetings/:id" element={<MeetingDetails />} />
        <Route path="meetings/:id/join" element={<JoinMeeting />} />

        <Route
          path="team"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager']}>
              <Team />
            </RoleGuard>
          }
        />
        <Route
          path="admin"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AdminPanel />
            </RoleGuard>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
