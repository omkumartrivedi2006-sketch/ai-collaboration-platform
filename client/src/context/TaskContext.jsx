import React, { createContext, useState, useContext, useCallback } from 'react';
import taskService from '../services/taskService';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [filters, setFilters] = useState({
    projectId: '',
    assignedTo: '',
    status: '',
    priority: '',
    search: '',
    isArchived: false,
    page: 1,
    limit: 50, // default limit is larger for Kanban views
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchTasks = useCallback(async (customParams = {}) => {
    setLoading(true);
    try {
      const mergedParams = { ...filters, ...customParams };
      const response = await taskService.getTasks(mergedParams);
      setTasks(response.tasks || []);
      setTotalTasks(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  };

  const resetFilters = () => {
    setFilters({
      projectId: '',
      assignedTo: '',
      status: '',
      priority: '',
      search: '',
      isArchived: false,
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const fetchTaskDetails = async (id) => {
    setLoading(true);
    try {
      const data = await taskService.getTask(id);
      setActiveTask(data.task);
      return data.task;
    } catch (error) {
      console.error('Failed to fetch task details:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    setLoading(true);
    try {
      const data = await taskService.createTask(taskData);
      await fetchTasks();
      return data.task;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const data = await taskService.updateTask(id, taskData);
      if (activeTask && activeTask.id === id) {
        // Reload details to get all nested models
        await fetchTaskDetails(id);
      }
      // Optimistic update of local tasks list
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data.task } : t))
      );
      return data.task;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (activeTask && activeTask.id === id) {
        setActiveTask(null);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const updateTaskStatus = async (id, status) => {
    // Optimistically update status to prevent sluggish Kanban transitions
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );

    try {
      const data = await taskService.updateTaskStatus(id, status);
      if (activeTask && activeTask.id === id) {
        await fetchTaskDetails(id);
      }
      return data.task;
    } catch (error) {
      // Revert state on error
      await fetchTasks();
      console.error('Failed to update task status:', error);
      throw error;
    }
  };

  const updateTaskPriority = async (id, priority) => {
    try {
      const data = await taskService.updateTaskPriority(id, priority);
      if (activeTask && activeTask.id === id) {
        await fetchTaskDetails(id);
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority } : t))
      );
      return data.task;
    } catch (error) {
      console.error('Failed to update task priority:', error);
      throw error;
    }
  };

  const archiveTask = async (id) => {
    try {
      await taskService.archiveTask(id);
      await fetchTasks();
      if (activeTask && activeTask.id === id) {
        setActiveTask(null);
      }
    } catch (error) {
      console.error('Failed to archive task:', error);
      throw error;
    }
  };

  const restoreTask = async (id) => {
    try {
      await taskService.restoreTask(id);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to restore task:', error);
      throw error;
    }
  };

  const addComment = async (taskId, commentText) => {
    try {
      const data = await taskService.addComment(taskId, commentText);
      if (activeTask && activeTask.id === taskId) {
        await fetchTaskDetails(taskId);
      }
      return data.comment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const updateComment = async (commentId, commentText) => {
    try {
      const data = await taskService.updateComment(commentId, commentText);
      if (activeTask) {
        await fetchTaskDetails(activeTask.id);
      }
      return data.comment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await taskService.deleteComment(commentId);
      if (activeTask) {
        await fetchTaskDetails(activeTask.id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  const addAttachment = async (taskId, formData) => {
    try {
      const data = await taskService.addAttachment(taskId, formData);
      if (activeTask && activeTask.id === taskId) {
        await fetchTaskDetails(taskId);
      }
      return data.attachment;
    } catch (error) {
      console.error('Failed to add attachment:', error);
      throw error;
    }
  };

  const deleteAttachment = async (attachmentId) => {
    try {
      await taskService.deleteAttachment(attachmentId);
      if (activeTask) {
        await fetchTaskDetails(activeTask.id);
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        totalTasks,
        loading,
        filters,
        activeTask,
        fetchTasks,
        fetchTaskDetails,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskPriority,
        archiveTask,
        restoreTask,
        addComment,
        updateComment,
        deleteComment,
        addAttachment,
        deleteAttachment,
        updateFilters,
        resetFilters
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default useTasks;
