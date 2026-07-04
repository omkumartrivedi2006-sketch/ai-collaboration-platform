import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';

const Landing = React.lazy(() => import('../pages/Landing'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Team = React.lazy(() => import('../pages/Team'));
const AdminPanel = React.lazy(() => import('../pages/AdminPanel'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

const ProjectsList = React.lazy(() => import('../pages/ProjectsList'));
const CreateProject = React.lazy(() => import('../pages/CreateProject'));
const EditProject = React.lazy(() => import('../pages/EditProject'));
const ProjectDetails = React.lazy(() => import('../pages/ProjectDetails'));

const TaskBoard = React.lazy(() => import('../pages/TaskBoard'));
const TaskList = React.lazy(() => import('../pages/TaskList'));
const TaskDetails = React.lazy(() => import('../pages/TaskDetails'));
const CreateTask = React.lazy(() => import('../pages/CreateTask'));
const EditTask = React.lazy(() => import('../pages/EditTask'));

const ChatDashboard = React.lazy(() => import('../pages/ChatDashboard'));
const NotificationCenter = React.lazy(() => import('../pages/NotificationCenter'));
const FilesDashboard = React.lazy(() => import('../pages/FilesDashboard'));
const ProjectFiles = React.lazy(() => import('../pages/ProjectFiles'));
const MeetingsDashboard = React.lazy(() => import('../pages/MeetingsDashboard'));
const MeetingDetails = React.lazy(() => import('../pages/MeetingDetails'));
const JoinMeeting = React.lazy(() => import('../pages/JoinMeeting'));
const CalendarView = React.lazy(() => import('../pages/CalendarView'));
const AIAssistant = React.lazy(() => import('../pages/AIAssistant'));
const AIReports = React.lazy(() => import('../pages/AIReports'));
const MeetingSummary = React.lazy(() => import('../pages/MeetingSummary'));
const DocumentSummary = React.lazy(() => import('../pages/DocumentSummary'));
const AnalyticsDashboard = React.lazy(() => import('../pages/AnalyticsDashboard'));
const ProjectAnalytics = React.lazy(() => import('../pages/ProjectAnalytics'));
const TeamAnalytics = React.lazy(() => import('../pages/TeamAnalytics'));
const EmployeeAnalytics = React.lazy(() => import('../pages/EmployeeAnalytics'));
const Reports = React.lazy(() => import('../pages/Reports'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const UserManagement = React.lazy(() => import('../pages/UserManagement'));
const DepartmentManagement = React.lazy(() => import('../pages/DepartmentManagement'));
const AuditLogs = React.lazy(() => import('../pages/AuditLogs'));
const OrganizationSettings = React.lazy(() => import('../pages/OrganizationSettings'));
const SettingsDashboard = React.lazy(() => import('../pages/SettingsDashboard'));
const SettingsProfile = React.lazy(() => import('../pages/SettingsProfile'));
const SettingsSecurity = React.lazy(() => import('../pages/SettingsSecurity'));
const SettingsNotifications = React.lazy(() => import('../pages/SettingsNotifications'));
const SettingsAppearance = React.lazy(() => import('../pages/SettingsAppearance'));
const SettingsAccessibility = React.lazy(() => import('../pages/SettingsAccessibility'));
const SettingsSessions = React.lazy(() => import('../pages/SettingsSessions'));
const SettingsDevices = React.lazy(() => import('../pages/SettingsDevices'));


import ProtectedRoute from '../components/ProtectedRoute';
import RoleGuard from '../components/RoleGuard';
import DashboardLayout from '../layouts/DashboardLayout';

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<SkeletonLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Layout routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* Project Management routes */}
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:id/edit" element={<EditProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />

          {/* Task Management routes */}
          <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="projects/:projectId/tasks/create" element={<CreateTask />} />
          <Route path="tasks/:id/edit" element={<EditTask />} />

          {/* Real-time Collaboration routes */}
          <Route path="chat" element={<ChatDashboard />} />
          <Route path="notifications" element={<NotificationCenter />} />

          {/* Document Management routes */}
          <Route path="files" element={<FilesDashboard />} />
          <Route path="projects/:projectId/files" element={<ProjectFiles />} />

          {/* Meetings & Video Conferencing routes */}
          <Route path="meetings" element={<MeetingsDashboard />} />
          <Route path="meetings/calendar" element={<CalendarView />} />
          <Route path="meetings/:id" element={<MeetingDetails />} />
          <Route path="meetings/:id/join" element={<JoinMeeting />} />

          {/* AI Intelligence Layer routes */}
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="ai-reports" element={<AIReports />} />
          <Route path="meetings/:id/summary" element={<MeetingSummary />} />
          <Route path="files/summarize" element={<DocumentSummary />} />

          {/* Enterprise Analytics & Reporting routes */}
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="analytics/projects" element={<ProjectAnalytics />} />
          <Route path="analytics/team" element={<TeamAnalytics />} />
          <Route path="analytics/employees" element={<EmployeeAnalytics />} />
          <Route path="analytics/reports" element={<Reports />} />

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
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="admin/users"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <UserManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/departments"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <DepartmentManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/audit-logs"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <AuditLogs />
              </RoleGuard>
            }
          />
          <Route
            path="admin/settings"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <OrganizationSettings />
              </RoleGuard>
            }
          />

          {/* User settings & personalization routes */}
          <Route path="settings" element={<SettingsDashboard />} />
          <Route path="settings/profile" element={<SettingsProfile />} />
          <Route path="settings/security" element={<SettingsSecurity />} />
          <Route path="settings/notifications" element={<SettingsNotifications />} />
          <Route path="settings/appearance" element={<SettingsAppearance />} />
          <Route path="settings/accessibility" element={<SettingsAccessibility />} />
          <Route path="settings/sessions" element={<SettingsSessions />} />
          <Route path="settings/devices" element={<SettingsDevices />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
