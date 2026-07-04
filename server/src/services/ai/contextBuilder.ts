import prisma from '../../config/db';

export class ContextBuilder {
  async buildUserContext(userId: string): Promise<string> {
    // 1. Fetch User details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return 'Context: No active user authenticated.';
    }

    // 2. Fetch Projects associated with the user (either manager or member)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ],
        isArchived: false
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        priority: true
      }
    });

    const projectIds = projects.map(p => p.id);

    // 3. Fetch Tasks inside these projects, or assigned to this user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { projectId: { in: projectIds } },
          { assignedTo: userId }
        ],
        isArchived: false
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        assignee: {
          select: { name: true }
        },
        project: {
          select: { name: true, code: true }
        }
      },
      take: 15 // Limit context size for tokens performance
    });

    // 4. Fetch upcoming or live meetings this user has access to
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { organizerId: userId },
          { participants: { some: { userId } } },
          { projectId: { in: projectIds } }
        ],
        status: { in: ['SCHEDULED', 'LIVE'] }
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        project: {
          select: { name: true }
        }
      },
      take: 10
    });

    // Construct Markdown Context
    let contextStr = `### USER IDENTITY\nName: ${user.name}\nEmail: ${user.email}\nSystem Role: ${user.role}\n\n`;

    contextStr += `### ACCESSIBLE PROJECTS (${projects.length})\n`;
    projects.forEach(p => {
      contextStr += `- Project [${p.code}]: "${p.name}" (Status: ${p.status}, Priority: ${p.priority}). Description: ${p.description || 'N/A'}\n`;
    });

    contextStr += `\n### CURRENT ACTIVE TASKS (Recent 15)\n`;
    tasks.forEach(t => {
      const deadlineStr = t.deadline ? new Date(t.deadline).toLocaleDateString() : 'None';
      const assigneeName = t.assignee?.name || 'Unassigned';
      contextStr += `- Task in Project "${t.project.name}": "${t.title}" (Status: ${t.status}, Priority: ${t.priority}, Assignee: ${assigneeName}, Deadline: ${deadlineStr})\n`;
    });

    contextStr += `\n### LIVE & UPCOMING MEETINGS\n`;
    meetings.forEach(m => {
      const dateStr = new Date(m.startTime).toLocaleString();
      const projName = m.project?.name || 'Personal/None';
      contextStr += `- Meeting: "${m.title}" (Start: ${dateStr}, Status: ${m.status}, Associated Project: ${projName})\n`;
    });

    return contextStr;
  }
}
export default ContextBuilder;
