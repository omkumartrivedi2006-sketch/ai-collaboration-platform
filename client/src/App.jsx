import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { SocketProvider } from './context/SocketContext';
import { PresenceProvider } from './context/PresenceContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { FileProvider } from './context/FileContext';
import { FolderProvider } from './context/FolderContext';
import { UploadProvider } from './context/UploadContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <SocketProvider>
              <PresenceProvider>
                <ChatProvider>
                  <NotificationProvider>
                    <FolderProvider>
                      <FileProvider>
                        <UploadProvider>
                          <AppRoutes />
                        </UploadProvider>
                      </FileProvider>
                    </FolderProvider>
                  </NotificationProvider>
                </ChatProvider>
              </PresenceProvider>
            </SocketProvider>
          </TaskProvider>
        </ProjectProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b',
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
