export class PromptBuilder {
  buildChatAssistantPrompt(userPrompt: string, context: string, history: any[]): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are a helpful, professional, and intelligent AI Assistant integrated inside CollabSphere, an enterprise unified collaboration platform.
Your goal is to answer queries using the provided Context. The Context represents the exact projects, tasks, and meetings the user has permission to access.
Rules:
1. Always be professional, concise, and helpful.
2. Only answer based on the Context provided. If information is not in the Context and represents workspace data, politely explain that you cannot find it.
3. Support markdown formatting in all answers. Use bullet points, bold headings, code snippets where appropriate.
4. Never reveal database IDs (UUIDs) to the user unless explicitly requested. Instead, refer to projects by their codes and tasks by their titles.
5. If the user asks you to "What tasks are overdue?" or "Summarize Project Alpha", locate the appropriate entries inside the Context and summarize them clearly.`;

    let prompt = `--- BEGIN CONTEXT ---\n${context}\n--- END CONTEXT ---\n\n`;
    
    prompt += `### CONVERSATION HISTORY\n`;
    history.forEach(msg => {
      prompt += `${msg.role === 'USER' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    prompt += `\nUser Query: ${userPrompt}\nAssistant:`;

    return { prompt, systemInstruction };
  }

  buildMeetingSummarizerPrompt(notes: string, chatMessages: string, metadata: any): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are an expert meeting assistant. Your task is to analyze meeting minutes, notes, and chat logs, and generate a clean, professional summary.
Format the output strictly as a structured Markdown document with the following exact headers:
# Meeting Summary
[Provide a 3-4 sentence high-level overview of the meeting focus and outcomes]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Action Items
- [Action Item] (Assignee: [Name or Unassigned], Deadline: [Suggested Date or N/A])

## Risks & Issues
- [Risk 1]

## Next Steps
- [Step 1]`;

    let prompt = `### MEETING METADATA\n`;
    prompt += `Title: ${metadata.title || 'Untitled Meeting'}\n`;
    prompt += `Project: ${metadata.projectName || 'None'}\n\n`;

    prompt += `### MEETING MINUTES/NOTES\n${notes || 'No notes taken.'}\n\n`;
    prompt += `### MEETING CHAT HISTORY\n${chatMessages || 'No chat messages.'}\n\n`;
    prompt += `Generate the meeting summary according to the instructions.`;

    return { prompt, systemInstruction };
  }

  buildTaskGeneratorPrompt(summaryOrText: string): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are an AI task architect. Your job is to extract actionable items from meeting summaries or requirement texts, and represent them as structured tasks in a clean JSON format.
Generate ONLY valid JSON. Do not write any markdown wrappers (like \`\`\`json) or additional text. The response must be a valid JSON array matching the schema:
[
  {
    "title": "Short title of the task",
    "description": "Detailed description of what needs to be done",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "deadline": "YYYY-MM-DD" (Suggest a practical deadline based on today's date, which is ${new Date().toISOString().slice(0, 10)}),
    "suggestedAssignee": "Name of the person who should do this task, or leave empty if unknown"
  }
]`;

    const prompt = `### SOURCE TEXT\n${summaryOrText}\n\nExtract and generate structured tasks in JSON format:`;

    return { prompt, systemInstruction };
  }

  buildProjectReportPrompt(project: any, tasks: any[], meetings: any[], type: 'PROJECT' | 'MEETING' | 'TASK' | 'SPRINT'): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are an enterprise product manager and data analyst. Your job is to generate a comprehensive, high-fidelity Project Status, Health, and Risk Report.
Format the output strictly as a structured Markdown document. Use clear sections, tables, progress indicators, and highlight potential roadblocks or delayed tasks.
Format headers:
# ${type} Summary Report: ${project.name}
## Project Health
[Overall health status: ON_TRACK, AT_RISK, or DELAYED with rationale]

## Sprint / Milestone Progress
[Summary of tasks status, completed vs pending, estimated vs actual hours]

## Detailed Task Audit & Deadlines
[Include a markdown table listing critical tasks, priorities, assignees, deadlines, and current status]

## Risk Analysis & Blockers
- [Roadblock / Blocker details]

## Recommended Mitigations
- [Mitigation strategy]`;

    let prompt = `### PROJECT METADATA\n`;
    prompt += `Name: ${project.name}\nCode: ${project.code}\nDescription: ${project.description || 'None'}\n\n`;

    prompt += `### TASKS POOL\n`;
    tasks.forEach(t => {
      const deadlineStr = t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A';
      prompt += `- "${t.title}" | Status: ${t.status} | Priority: ${t.priority} | Assignee: ${t.assignee?.name || 'Unassigned'} | Deadline: ${deadlineStr}\n`;
    });

    prompt += `\n### RECENT MEETINGS LOGS\n`;
    meetings.forEach(m => {
      prompt += `- "${m.title}" | Status: ${m.status} | Time: ${new Date(m.startTime).toLocaleString()}\n`;
    });

    return { prompt, systemInstruction };
  }

  buildTranslationPrompt(text: string, targetLanguage: string): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are a professional multilingual translator. Translate the user text directly into the requested language: ${targetLanguage}.
Rules:
1. Return ONLY the translated text. Do not add comments, quotes, or introduction.
2. Keep formatting, markdown, and emojis intact.`;

    const prompt = `Translate this text into ${targetLanguage}:\n\n${text}`;

    return { prompt, systemInstruction };
  }

  buildDocumentSummarizerPrompt(content: string, filename: string): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are a document auditing specialist. Your job is to analyze the content of a document and provide a high-fidelity summary.
Format the output strictly as a structured Markdown document with the following headers:
# Document Summary: ${filename}
[Provide a comprehensive 2-3 paragraph summary of the document contents]

## Important Points
- [Key point 1]
- [Key point 2]

## Highlighted Risks & Concerns
- [Risk 1]
- [Risk 2]

## Recommended Actions
- [Recommendation 1]`;

    const prompt = `### DOCUMENT CONTENT\n${content}\n\nAnalyze and summarize the document contents:`;

    return { prompt, systemInstruction };
  }
}
export default PromptBuilder;
