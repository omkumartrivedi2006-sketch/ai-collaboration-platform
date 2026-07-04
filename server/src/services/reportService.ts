import prisma from '../config/db';
import { AnalyticsService } from './analyticsService';
import { AIReportType, Role } from '@prisma/client';

export class ReportService {
  private analyticsService = new AnalyticsService();

  async generateReport(
    userId: string,
    role: Role,
    type: 'PROJECT' | 'TEAM' | 'EMPLOYEE' | 'WEEKLY' | 'MONTHLY' | 'ORGANIZATION',
    filters: { projectId?: string; employeeId?: string; startDate?: Date; endDate?: Date }
  ) {
    const analyticsFilters = {
      startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
      endDate: filters.endDate || new Date(),
      projectId: filters.projectId,
      employeeId: filters.employeeId
    };

    let title = '';
    let content = '';
    let reportDbType: AIReportType = AIReportType.PROJECT;
    let targetProjectId = filters.projectId || null;

    if (type === 'PROJECT') {
      reportDbType = AIReportType.PROJECT;
      const projAnalyticsList = await this.analyticsService.getProjectAnalytics(userId, role, analyticsFilters);
      if (projAnalyticsList.length === 0) {
        throw new Error('No project found matching the filter credentials.');
      }
      const p = projAnalyticsList[0];
      targetProjectId = p.id;
      title = `Project Health & Status Report: ${p.name} (${p.code})`;

      content = `
# Project Health & Status Report: ${p.name} (${p.code})
**Generated On:** ${new Date().toLocaleString()}
**Reporting Period:** ${analyticsFilters.startDate.toLocaleDateString()} - ${analyticsFilters.endDate.toLocaleDateString()}
**Project Status:** ${p.status}
**Priority:** ${p.priority}

---

## 📈 Executive Summary Metrics
* **Overall Health Index:** **${p.healthScore}/100**
* **Task Completion Rate:** **${p.metrics.completionRate}%**
* **Average Completion Velocity:** **${p.metrics.avgCompletionTimeDays} days**

| Metric | Count |
| :--- | :--- |
| **Total Tasks** | ${p.metrics.totalTasks} |
| **Completed Tasks** | ${p.metrics.completedTasks} |
| **Pending Tasks** | ${p.metrics.pendingTasks} |
| **Blocked Tasks** | ${p.metrics.blockedTasks} |
| **Overdue Tasks** | ${p.metrics.overdueTasks} |

---

## 👥 Member Workload Balancing
Here is the task breakdown for all members active in this project:

| Member Name | Department | Assigned Tasks | Completed Tasks | Pending Tasks |
| :--- | :--- | :--- | :--- | :--- |
${p.memberWorkloads.map(w => `| ${w.name} | ${w.department || 'N/A'} | ${w.assigned} | ${w.completed} | ${w.pending} |`).join('\n')}

---

## 💡 Recommendations & Mitigations
* ${p.metrics.overdueTasks > 0 ? `⚠️ **Overdue Risk:** There are **${p.metrics.overdueTasks} overdue tasks**. Recommend rescheduling deadlines or reassigning loads.` : '✅ **No Overdue Risk:** Outstanding tasks are currently on schedule.'}
* ${p.metrics.blockedTasks > 0 ? `🛑 **Blockers Active:** There are **${p.metrics.blockedTasks} blocked tasks** requiring managerial intervention.` : '✅ **No Blockers:** All tasks are moving cleanly.'}
* ${p.healthScore < 80 ? '⚠️ **Low Health Index:** Project health rating is low. Recommend organizing a team review meeting to align resources.' : '🎉 **Healthy Sprint:** Project is in optimal condition.'}
`;
    } 
    else if (type === 'TEAM') {
      reportDbType = AIReportType.SPRINT;
      const teamAnalytics = await this.analyticsService.getTeamAnalytics(userId, role, analyticsFilters);
      title = `Team Load Balance & Productivity Report`;

      content = `
# Team Workload & Productivity Report
**Generated On:** ${new Date().toLocaleString()}
**Reporting Period:** ${analyticsFilters.startDate.toLocaleDateString()} - ${analyticsFilters.endDate.toLocaleDateString()}

---

## 📊 Individual Team Workloads & Velocities
This list represents workloads and velocities mapped across team members:

| Member Name | Assigned Tasks | Completed Tasks | Pending Tasks | Overdue Tasks | Est. Capacity Load | Avg. Velocity (Days) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${teamAnalytics.map(t => `| ${t.user.name} | ${t.metrics.totalTasks} | ${t.metrics.completedTasks} | ${t.metrics.pendingTasks} | ${t.metrics.overdueTasks} | ${t.metrics.loadPercentage}% | ${t.metrics.avgCompletionVelocityDays} days |`).join('\n')}

---

## 💡 Sprint Balancing Suggestions
* **Underutilized Members:** Members with < 30% load can assume additional backlogs.
* **Overloaded Members:** Members with > 80% capacity should be reviewed for resource reallocations or sub-task partitioning.
`;
    }
    else if (type === 'EMPLOYEE') {
      reportDbType = AIReportType.TASK;
      const empAnalyticsList = await this.analyticsService.getEmployeeAnalytics(userId, role, analyticsFilters);
      if (empAnalyticsList.length === 0) {
        throw new Error('No employee metrics found matching the filter.');
      }
      const e = empAnalyticsList[0];
      title = `Employee Performance Audit: ${e.employee.name}`;

      content = `
# Employee Performance Audit: ${e.employee.name}
**Department:** ${e.employee.department || 'N/A'}
**Designation:** ${e.employee.designation || 'N/A'}
**Generated On:** ${new Date().toLocaleString()}

---

## 🏆 Productivity Summary
* **AI Calculated Productivity Score:** **${e.metrics.productivityScore}/100**

| Performance Index | Activity Count |
| :--- | :--- |
| **Tasks Assigned** | ${e.metrics.assignedTasks} |
| **Tasks Completed** | ${e.metrics.completedTasks} |
| **Tasks Overdue** | ${e.metrics.overdueTasks} |
| **Chat Messages Sent** | ${e.metrics.messagesSent} |
| **Documents Uploaded** | ${e.metrics.filesUploaded} |
| **Meetings Attended** | ${e.metrics.meetingsAttended} |
| **AI Assistant Queries** | ${e.metrics.aiRequests} |

---

## 💡 Developer Development Path
* ${e.metrics.productivityScore >= 80 ? '🌟 **Top Performer:** Demonstrates high productivity. Suitable for mentoring or leadership assignments.' : e.metrics.productivityScore >= 50 ? '📈 **Solid Performer:** Meets core sprint benchmarks. Keep tracking backlog items.' : '⚠️ **Performance Warning:** Productivity score indicates support may be needed. Recommend establishing a one-on-one session to clear blockers.'}
`;
    }
    else if (type === 'WEEKLY' || type === 'MONTHLY' || type === 'ORGANIZATION') {
      reportDbType = AIReportType.PROJECT;
      const overview = await this.analyticsService.getDashboardOverview(userId, role, analyticsFilters);
      title = `${type.charAt(0) + type.slice(1).toLowerCase()} Executive Workspace Summary`;

      content = `
# ${type} Workspace Performance Report
**Generated On:** ${new Date().toLocaleString()}
**Reporting Period:** ${analyticsFilters.startDate.toLocaleDateString()} - ${analyticsFilters.endDate.toLocaleDateString()}

---

## 📈 Key Workspace Indicators (KPIs)
* **Overall Health Index:** **${overview.kpi.healthScore}/100**
* **Active Projects:** **${overview.kpi.projectsCount}**
* **Completion Rate:** **${overview.kpi.completionRate}%**

| Metric Indicator | Workspace Volume |
| :--- | :--- |
| **Total Backlogs (Tasks)** | ${overview.kpi.totalTasks} |
| **Completed Backlogs** | ${overview.kpi.completedTasks} |
| **Blocked Backlogs** | ${overview.kpi.blockedTasks} |
| **Overdue Backlogs** | ${overview.kpi.overdueTasks} |
| **Meetings Facilitated** | ${overview.kpi.totalMeetings} |
| **Avg Completion Velocity** | ${overview.kpi.avgCompletionDays} Days |

---

## 📋 Recent Workspace Timeline Logs
Historical modifications audited across projects during this period:

| Type | Action Details | Resource | Timestamp |
| :--- | :--- | :--- | :--- |
${overview.activities.map(a => `| ${a.type} | ${a.action} | ${a.title} | ${new Date(a.createdAt).toLocaleString()} |`).join('\n')}
`;
    }

    // Save Generated Report
    const report = await prisma.generatedReport.create({
      data: {
        projectId: targetProjectId,
        title,
        content: content.trim(),
        type: reportDbType,
        generatedBy: userId
      }
    });

    return report;
  }
}

export default ReportService;
