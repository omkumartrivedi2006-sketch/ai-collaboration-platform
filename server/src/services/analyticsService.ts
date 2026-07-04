import prisma from '../config/db';
import { TaskStatus, TaskPriority, Role } from '@prisma/client';

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  department?: string;
  employeeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export class AnalyticsService {
  /**
   * Helper to build date range clause
   */
  private getDateFilter(field: string, startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return {};
    const range: any = {};
    if (startDate) range.gte = startDate;
    if (endDate) range.lte = endDate;
    return { [field]: range };
  }

  /**
   * Executive / Role-based Dashboard Analytics
   */
  async getDashboardOverview(userId: string, role: Role, filters: AnalyticsFilter) {
    const dateFilter = this.getDateFilter('createdAt', filters.startDate, filters.endDate);

    // 1. Determine Scope based on Role
    let projectScopeClause: any = {};
    let taskScopeClause: any = {};
    let userScopeClause: any = {};

    if (role === Role.Employee) {
      // Employees only see their own assigned tasks and projects they are member of
      projectScopeClause = {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      };
      taskScopeClause = { assignedTo: userId };
      userScopeClause = { id: userId };
    } else if (role === Role.Manager) {
      // Managers see projects they manage or are member of
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } }
          ]
        },
        select: { id: true }
      });
      const managedProjectIds = projects.map(p => p.id);

      projectScopeClause = { id: { in: managedProjectIds } };
      taskScopeClause = { projectId: { in: managedProjectIds } };
      
      // Get users who are members of the managed projects
      const members = await prisma.projectMember.findMany({
        where: { projectId: { in: managedProjectIds } },
        select: { userId: true }
      });
      const memberIds = Array.from(new Set([...members.map(m => m.userId), userId]));
      userScopeClause = { id: { in: memberIds } };
    }

    // Apply department filter if present
    if (filters.department) {
      userScopeClause = {
        ...userScopeClause,
        department: filters.department
      };
    }

    // Apply project filter if specific project is requested
    if (filters.projectId) {
      projectScopeClause = { id: filters.projectId };
      taskScopeClause = { ...taskScopeClause, projectId: filters.projectId };
    }

    // 2. Fetch Projects Summary
    const projectsCount = await prisma.project.count({
      where: { ...projectScopeClause, isArchived: false }
    });
    const completedProjectsCount = await prisma.project.count({
      where: { ...projectScopeClause, status: 'COMPLETED', isArchived: false }
    });

    // 3. Fetch Tasks summary
    const taskFilters: any = {
      ...taskScopeClause,
      isArchived: false,
      ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
    };
    if (filters.status) taskFilters.status = filters.status;
    if (filters.priority) taskFilters.priority = filters.priority;
    if (filters.employeeId) taskFilters.assignedTo = filters.employeeId;

    const totalTasks = await prisma.task.count({ where: taskFilters });
    const completedTasks = await prisma.task.count({
      where: { ...taskFilters, status: TaskStatus.COMPLETED }
    });
    const blockedTasks = await prisma.task.count({
      where: { ...taskFilters, status: TaskStatus.BLOCKED }
    });
    const pendingTasks = totalTasks - completedTasks;
    
    const overdueTasks = await prisma.task.count({
      where: {
        ...taskFilters,
        status: { not: TaskStatus.COMPLETED },
        deadline: { lt: new Date() }
      }
    });

    // 4. Productivity metrics
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const taskVelocityResult = await prisma.task.findMany({
      where: {
        ...taskFilters,
        status: TaskStatus.COMPLETED,
        completedAt: { not: null },
        startDate: { not: null }
      },
      select: { createdAt: true, completedAt: true }
    });

    let avgCompletionDays = 0;
    if (taskVelocityResult.length > 0) {
      const totalDays = taskVelocityResult.reduce((sum, task) => {
        const diff = new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime();
        return sum + (diff / (1000 * 60 * 60 * 24));
      }, 0);
      avgCompletionDays = parseFloat((totalDays / taskVelocityResult.length).toFixed(1));
    }

    // 5. Meetings summary
    let meetingScopeClause: any = {};
    if (role === Role.Employee) {
      meetingScopeClause = {
        OR: [
          { organizerId: userId },
          { participants: { some: { userId } } }
        ]
      };
    } else if (role === Role.Manager) {
      // Find projectIds managed
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } }
          ]
        },
        select: { id: true }
      });
      const pIds = projects.map(p => p.id);
      meetingScopeClause = {
        OR: [
          { organizerId: userId },
          { projectId: { in: pIds } },
          { participants: { some: { userId } } }
        ]
      };
    }

    const meetingFilters: any = {
      ...meetingScopeClause,
      ...this.getDateFilter('startTime', filters.startDate, filters.endDate)
    };
    if (filters.projectId) meetingFilters.projectId = filters.projectId;

    const totalMeetings = await prisma.meeting.count({ where: meetingFilters });
    const completedMeetings = await prisma.meeting.count({
      where: { ...meetingFilters, status: 'COMPLETED' }
    });

    // 6. Recent activities
    const recentTaskActivities = await prisma.taskActivity.findMany({
      where: {
        task: taskScopeClause
      },
      include: {
        user: { select: { name: true, avatar: true } },
        task: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentProjectActivities = await prisma.projectActivity.findMany({
      where: {
        project: projectScopeClause
      },
      include: {
        user: { select: { name: true, avatar: true } },
        project: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Merge and sort activities
    const activities = [
      ...recentTaskActivities.map(a => ({
        id: a.id,
        type: 'TASK',
        action: a.action,
        title: a.task.title,
        user: a.user,
        createdAt: a.createdAt
      })),
      ...recentProjectActivities.map(a => ({
        id: a.id,
        type: 'PROJECT',
        action: a.action,
        title: `${a.project.code} - ${a.project.name}`,
        user: a.user,
        createdAt: a.createdAt
      }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 7);

    // 7. Calculate overall health index
    let healthScore = 100;
    if (totalTasks > 0) {
      const overduePenalty = (overdueTasks / totalTasks) * 40;
      const completionBonus = (completedTasks / totalTasks) * 40;
      const blockedPenalty = (blockedTasks / totalTasks) * 20;
      healthScore = Math.max(0, Math.min(100, Math.round(20 + completionBonus - overduePenalty - blockedPenalty)));
    }

    return {
      kpi: {
        projectsCount,
        completedProjectsCount,
        totalTasks,
        completedTasks,
        pendingTasks,
        blockedTasks,
        overdueTasks,
        completionRate,
        avgCompletionDays,
        totalMeetings,
        completedMeetings,
        healthScore
      },
      activities
    };
  }

  /**
   * Detailed Project-Level Analytics
   */
  async getProjectAnalytics(userId: string, role: Role, filters: AnalyticsFilter) {
    let projectScope: any = {};
    if (role === Role.Employee) {
      projectScope = {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      };
    } else if (role === Role.Manager) {
      projectScope = {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      };
    }

    if (filters.projectId) {
      projectScope = { id: filters.projectId };
    }

    const projects = await prisma.project.findMany({
      where: { ...projectScope, isArchived: false },
      include: {
        manager: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, department: true } } } },
        tasks: {
          where: {
            isArchived: false,
            ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
          },
          include: { assignee: { select: { id: true, name: true } } }
        }
      }
    });

    const projectAnalyticsList = projects.map(p => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const pendingTasks = p.tasks.filter(t => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.IN_REVIEW).length;
      const blockedTasks = p.tasks.filter(t => t.status === TaskStatus.BLOCKED).length;
      const overdueTasks = p.tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.deadline && new Date(t.deadline) < new Date()).length;

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Completion velocity in days
      let avgCompletionTimeDays = 0;
      const completedTasksWithTimes = p.tasks.filter(t => t.status === TaskStatus.COMPLETED && t.completedAt);
      if (completedTasksWithTimes.length > 0) {
        const sumDays = completedTasksWithTimes.reduce((sum, t) => {
          const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
          return sum + (diff / (1000 * 60 * 60 * 24));
        }, 0);
        avgCompletionTimeDays = parseFloat((sumDays / completedTasksWithTimes.length).toFixed(1));
      }

      // Health Score Calculation
      let healthScore = 100;
      if (totalTasks > 0) {
        const penalty = (overdueTasks / totalTasks) * 45 + (blockedTasks / totalTasks) * 25;
        healthScore = Math.max(0, Math.round(100 - penalty));
      }

      // Member Workloads
      const memberWorkloads = p.members.map(m => {
        const memberTasks = p.tasks.filter(t => t.assignedTo === m.userId);
        return {
          userId: m.userId,
          name: m.user.name,
          department: m.user.department,
          assigned: memberTasks.length,
          completed: memberTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
          pending: memberTasks.filter(t => t.status !== TaskStatus.COMPLETED).length
        };
      });

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        priority: p.priority,
        manager: p.manager,
        healthScore,
        metrics: {
          totalTasks,
          completedTasks,
          pendingTasks,
          blockedTasks,
          overdueTasks,
          completionRate,
          avgCompletionTimeDays
        },
        memberWorkloads
      };
    });

    return projectAnalyticsList;
  }

  /**
   * Team/Workload Performance Analytics
   */
  async getTeamAnalytics(userId: string, role: Role, filters: AnalyticsFilter) {
    let projectScope: any = {};
    if (role === Role.Employee) {
      projectScope = { members: { some: { userId } } };
    } else if (role === Role.Manager) {
      projectScope = {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      };
    }

    if (filters.projectId) {
      projectScope = { id: filters.projectId };
    }

    // Get accessible projects
    const projects = await prisma.project.findMany({
      where: { ...projectScope, isArchived: false },
      select: { id: true }
    });
    const projectIds = projects.map(p => p.id);

    // Fetch team members involved in these projects
    const memberships = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            department: true,
            designation: true
          }
        }
      }
    });

    const uniqueUsersMap = new Map<string, any>();
    memberships.forEach(m => {
      uniqueUsersMap.set(m.user.id, m.user);
    });

    // Also include project managers
    const projManagers = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: { manager: { select: { id: true, name: true, email: true, avatar: true, department: true, designation: true } } }
    });
    projManagers.forEach(p => {
      uniqueUsersMap.set(p.manager.id, p.manager);
    });

    const teamUsers = Array.from(uniqueUsersMap.values());

    const teamAnalytics = await Promise.all(
      teamUsers.map(async (u) => {
        // Fetch tasks of this user in the specified projects scope
        const taskFilters: any = {
          assignedTo: u.id,
          projectId: { in: projectIds },
          isArchived: false,
          ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
        };
        if (filters.status) taskFilters.status = filters.status;
        if (filters.priority) taskFilters.priority = filters.priority;

        const totalTasks = await prisma.task.count({ where: taskFilters });
        const completedTasks = await prisma.task.count({
          where: { ...taskFilters, status: TaskStatus.COMPLETED }
        });
        const blockedTasks = await prisma.task.count({
          where: { ...taskFilters, status: TaskStatus.BLOCKED }
        });
        const pendingTasks = totalTasks - completedTasks;
        
        const overdueTasks = await prisma.task.count({
          where: {
            ...taskFilters,
            status: { not: TaskStatus.COMPLETED },
            deadline: { lt: new Date() }
          }
        });

        // Workload rate out of 10 tasks (capacity standard)
        const loadPercentage = Math.min(100, Math.round((totalTasks / 8) * 100));

        // Average completion velocity
        const taskTimes = await prisma.task.findMany({
          where: {
            ...taskFilters,
            status: TaskStatus.COMPLETED,
            completedAt: { not: null }
          },
          select: { createdAt: true, completedAt: true }
        });

        let avgDays = 0;
        if (taskTimes.length > 0) {
          const totalDays = taskTimes.reduce((sum, t) => {
            const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
            return sum + (diff / (1000 * 60 * 60 * 24));
          }, 0);
          avgDays = parseFloat((totalDays / taskTimes.length).toFixed(1));
        }

        return {
          user: u,
          metrics: {
            totalTasks,
            completedTasks,
            pendingTasks,
            blockedTasks,
            overdueTasks,
            loadPercentage,
            avgCompletionVelocityDays: avgDays
          }
        };
      })
    );

    return teamAnalytics;
  }

  /**
   * Detailed Employee Productivity Analytics
   */
  async getEmployeeAnalytics(userId: string, role: Role, filters: AnalyticsFilter) {
    let userFilters: any = {};

    if (role === Role.Employee) {
      // Employee can only see their own metrics
      userFilters = { id: userId };
    } else if (role === Role.Manager) {
      // Manager can see members of projects they manage
      const managedProjects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } }
          ]
        },
        select: { id: true }
      });
      const pIds = managedProjects.map(p => p.id);
      const members = await prisma.projectMember.findMany({
        where: { projectId: { in: pIds } },
        select: { userId: true }
      });
      const uniqueIds = Array.from(new Set([...members.map(m => m.userId), userId]));
      userFilters = { id: { in: uniqueIds } };
    }

    if (filters.employeeId) {
      // If filtering for specific employee, ensure user has access
      if (role === Role.Employee && filters.employeeId !== userId) {
        userFilters = { id: userId }; // Force own data
      } else {
        userFilters = { id: filters.employeeId };
      }
    }

    if (filters.department) {
      userFilters = { ...userFilters, department: filters.department };
    }

    const employees = await prisma.user.findMany({
      where: userFilters,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        department: true,
        designation: true,
        createdAt: true
      }
    });

    const employeeAnalytics = await Promise.all(
      employees.map(async (emp) => {
        const dateFilter = this.getDateFilter('createdAt', filters.startDate, filters.endDate);

        // 1. Task calculations
        const taskFilters: any = {
          assignedTo: emp.id,
          isArchived: false,
          ...dateFilter
        };
        if (filters.projectId) taskFilters.projectId = filters.projectId;

        const totalTasks = await prisma.task.count({ where: taskFilters });
        const completedTasks = await prisma.task.count({
          where: { ...taskFilters, status: TaskStatus.COMPLETED }
        });
        const overdueTasks = await prisma.task.count({
          where: {
            ...taskFilters,
            status: { not: TaskStatus.COMPLETED },
            deadline: { lt: new Date() }
          }
        });

        // 2. Chat message calculations
        const messageFilters: any = {
          senderId: emp.id,
          ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
        };
        const messagesSent = await prisma.message.count({ where: messageFilters });

        // 3. File uploads calculations
        const fileFilters: any = {
          uploadedBy: emp.id,
          isDeleted: false,
          ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
        };
        const filesUploaded = await prisma.file.count({ where: fileFilters });

        // 4. Meeting participations calculations
        const meetingParticipantFilters: any = {
          userId: emp.id,
          attendanceStatus: 'ATTENDED',
          meeting: this.getDateFilter('startTime', filters.startDate, filters.endDate)
        };
        const meetingsAttended = await prisma.meetingParticipant.count({
          where: meetingParticipantFilters
        });

        // 5. AI usage requests logs count
        const aiRequestFilters: any = {
          userId: emp.id,
          ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
        };
        const aiRequests = await prisma.aIRequestLog.count({ where: aiRequestFilters });

        // 6. Productivity Score Algorithm (Weighted indices)
        // Completion rate: 50%, Overdue penalty: -20%, File uploads: 10%, Messages: 10%, Meetings: 10%
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
        const overduePenalty = totalTasks > 0 ? (overdueTasks / totalTasks) : 0;
        
        const fileBonus = Math.min(1.0, filesUploaded / 5);
        const msgBonus = Math.min(1.0, messagesSent / 50);
        const meetingBonus = Math.min(1.0, meetingsAttended / 3);

        const calculatedScore = (completionRate * 50) + (fileBonus * 10) + (msgBonus * 15) + (meetingBonus * 15) - (overduePenalty * 20) + 20;
        const productivityScore = Math.max(0, Math.min(100, Math.round(calculatedScore)));

        return {
          employee: emp,
          metrics: {
            assignedTasks: totalTasks,
            completedTasks,
            overdueTasks,
            messagesSent,
            filesUploaded,
            meetingsAttended,
            aiRequests,
            productivityScore
          }
        };
      })
    );

    return employeeAnalytics;
  }

  /**
   * Meeting Statistics & Engagement
   */
  async getMeetingAnalytics(userId: string, role: Role, filters: AnalyticsFilter) {
    let meetingScope: any = {};
    if (role === Role.Employee) {
      meetingScope = {
        OR: [
          { organizerId: userId },
          { participants: { some: { userId } } }
        ]
      };
    } else if (role === Role.Manager) {
      const managedProjects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } }
          ]
        },
        select: { id: true }
      });
      const pIds = managedProjects.map(p => p.id);
      meetingScope = {
        OR: [
          { organizerId: userId },
          { projectId: { in: pIds } },
          { participants: { some: { userId } } }
        ]
      };
    }

    const meetingFilters: any = {
      ...meetingScope,
      ...this.getDateFilter('startTime', filters.startDate, filters.endDate)
    };
    if (filters.projectId) meetingFilters.projectId = filters.projectId;

    const meetings = await prisma.meeting.findMany({
      where: meetingFilters,
      include: {
        participants: true,
        organizer: { select: { name: true } }
      }
    });

    const meetingsHeld = meetings.filter(m => m.status === 'COMPLETED').length;
    const upcomingMeetings = meetings.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').length;
    const cancelledMeetings = meetings.filter(m => m.status === 'CANCELLED').length;

    // Attendance rates calculations
    let totalInvited = 0;
    let totalAttended = 0;
    let sumDurationMin = 0;
    let completedMeetingCount = 0;

    meetings.forEach(m => {
      m.participants.forEach(p => {
        totalInvited++;
        if (p.attendanceStatus === 'ATTENDED' || p.attendanceStatus === 'ACCEPTED') {
          totalAttended++;
        }
      });

      if (m.status === 'COMPLETED') {
        completedMeetingCount++;
        const durationMs = new Date(m.endTime).getTime() - new Date(m.startTime).getTime();
        sumDurationMin += (durationMs / (1000 * 60));
      }
    });

    const attendanceRate = totalInvited > 0 ? Math.round((totalAttended / totalInvited) * 100) : 0;
    const averageDurationMin = completedMeetingCount > 0 ? Math.round(sumDurationMin / completedMeetingCount) : 0;

    return {
      meetingsHeld,
      upcomingMeetings,
      cancelledMeetings,
      attendanceRate,
      averageDurationMin,
      list: meetings.map(m => ({
        id: m.id,
        title: m.title,
        startTime: m.startTime,
        endTime: m.endTime,
        status: m.status,
        organizer: m.organizer.name,
        participantsCount: m.participants.length
      }))
    };
  }

  /**
   * AI Usage Analytics
   */
  async getAIAnalytics(userId: string, role: Role, filters: AnalyticsFilter) {
    let logScope: any = {};
    if (role === Role.Employee) {
      logScope = { userId };
    } else if (role === Role.Manager) {
      // Find members of managed projects
      const managedProjects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } }
          ]
        },
        select: { id: true }
      });
      const pIds = managedProjects.map(p => p.id);
      const members = await prisma.projectMember.findMany({
        where: { projectId: { in: pIds } },
        select: { userId: true }
      });
      const uniqueIds = Array.from(new Set([...members.map(m => m.userId), userId]));
      logScope = { userId: { in: uniqueIds } };
    }

    const aiFilters = {
      ...logScope,
      ...this.getDateFilter('createdAt', filters.startDate, filters.endDate)
    };

    const totalRequests = await prisma.aIRequestLog.count({ where: aiFilters });
    const successRequests = await prisma.aIRequestLog.count({ where: { ...aiFilters, status: 'SUCCESS' } });
    const failedRequests = totalRequests - successRequests;

    // Feature distribution
    const logs = await prisma.aIRequestLog.findMany({
      where: aiFilters,
      select: { feature: true, responseTime: true, totalTokens: true }
    });

    const featureCountMap: { [key: string]: number } = {};
    let totalResponseTime = 0;
    let totalTokensUsed = 0;

    logs.forEach(l => {
      featureCountMap[l.feature] = (featureCountMap[l.feature] || 0) + 1;
      totalResponseTime += l.responseTime;
      totalTokensUsed += l.totalTokens || 0;
    });

    const averageResponseTimeMs = logs.length > 0 ? Math.round(totalResponseTime / logs.length) : 0;

    const featureUsage = Object.keys(featureCountMap).map(f => ({
      feature: f,
      count: featureCountMap[f]
    }));

    return {
      totalRequests,
      successRequests,
      failedRequests,
      averageResponseTimeMs,
      totalTokensUsed,
      featureUsage
    };
  }
}

export default AnalyticsService;
