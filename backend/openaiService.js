const OpenAI = require("openai");

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // Set the timezone for the service
    this.timezone = "Asia/Kolkata";

    // Define constants for time parsing
    this.DAYS_OF_WEEK = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    this.VAGUE_TIME_REFS = [
      "tonight",
      "next week",
      "soon",
      "this evening",
      "this afternoon",
      "this week",
    ];
  }

  // Helper method to get the base task parsing prompt
  #getTaskParsingPrompt(currentDate) {
    return `You are a task parsing assistant that extracts structured data from natural language task descriptions. Your job is to identify:

1. Task title (the main action/work to be done)
2. Assignee (the person responsible for the task)
3. Due date/time reference
4. Priority level (P1, P2, P3, or P4)

Guidelines for extraction:
- ALWAYS try to identify a person's name as the assignee, even if not explicitly marked with "by" or "for"
- If no priority is specified, default to P3
- For due dates, follow these rules:
  * If ONLY a day name is mentioned (e.g., "by Wednesday"), return just the day name as a string (e.g., "wednesday")
  * If a vague time reference is used (e.g., "tonight", "next week"), return that exact phrase
  * For specific dates/times, format as ISO strings with these rules:
    - All times are in the ${this.timezone} timezone
    - For explicit dates with year (e.g., "June 20, 2025"), use that exact year
    - For relative dates with time ("tomorrow 3pm"), calculate from: ${currentDate.toLocaleString(
      "en-US",
      { timeZone: this.timezone }
    )}
    - For dates without year (e.g., "June 20 at 2pm"), use current year (${currentDate.getFullYear()})
    - IMPORTANT: Always preserve the EXACT time mentioned (e.g., "3pm" should be exactly 15:00)
    - If no specific time given with date, default to 23:59:59
    - Return dates in ISO format with timezone offset for ${this.timezone}

Example inputs and expected outputs:
✓ "Do it by Wednesday" → dueDate: "wednesday"
✓ "Complete by tonight" → dueDate: "tonight"
✓ "Due next week" → dueDate: "next week"
✓ "Meeting tomorrow 3pm" → dueDate: "2024-02-21T15:00:00+05:30"
✓ "Review by June 20th 2pm" → dueDate: "2024-06-20T14:00:00+05:30"
✓ "Submit by Friday 6pm" → dueDate: "friday"

IMPORTANT: For day names and vague time references, return the exact string in lowercase. For specific dates and times, return ISO format.`;
  }

  #isVagueTimeReference(text) {
    return this.VAGUE_TIME_REFS.some((ref) =>
      text.toLowerCase().includes(ref.toLowerCase())
    );
  }

  #isDayOfWeek(text) {
    return this.DAYS_OF_WEEK.some(
      (day) => text.toLowerCase() === day.toLowerCase()
    );
  }

  #hasSpecificTime(text) {
    return (
      /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i.test(text) ||
      /\b(?:at|by)\s+\d{1,2}(?::\d{2})?\b/i.test(text)
    );
  }

  #hasSpecificDate(text) {
    // Match patterns like "June 20", "20th June", "2024-06-20", "06/20/2024"
    const datePatterns = [
      /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?\b/i,
      /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/i,
      /\b\d{4}-\d{2}-\d{2}\b/,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
    ];

    return datePatterns.some((pattern) => pattern.test(text));
  }

  #extractTimeFromText(text, assignee) {
    // First try to find time associated with the specific assignee
    const assigneePattern = new RegExp(
      `${assignee}[^.]*?\\b(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm))\\b`,
      "i"
    );
    const assigneeMatch = text.match(assigneePattern);
    if (assigneeMatch) {
      return assigneeMatch[1];
    }

    // If no time found with assignee, look for any time in the text
    const timePattern = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i;
    const timeMatch = text.match(timePattern);
    return timeMatch ? timeMatch[1] : null;
  }

  // Helper method to format date with timezone
  #formatDateWithTimezone(date) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: this.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const dateParts = {};
    parts.forEach((part) => {
      if (part.type !== "literal") {
        dateParts[part.type] = part.value;
      }
    });

    return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}+05:30`;
  }

  // Helper method to process a task's date
  #processTaskDate(task, inputText, currentDate) {
    const dueText = task.originalDue?.toLowerCase() || "";

    if (typeof task.dueDate === "string") {
      const lowerDueDate = task.dueDate.toLowerCase();
      if (
        this.#isDayOfWeek(lowerDueDate) ||
        this.#isVagueTimeReference(lowerDueDate)
      ) {
        task.dueDate =
          lowerDueDate.charAt(0).toUpperCase() + lowerDueDate.slice(1);
        return task;
      }
    }

    if (task.dueDate) {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(task.dueDate)) {
        const dueDate = new Date(task.dueDate);

        if (isNaN(dueDate.getTime())) {
          console.warn("Invalid date format received:", task.dueDate);
          task.dueDate = null;
        } else {
          const hasExplicitYear = inputText.includes(
            dueDate.getFullYear().toString()
          );
          if (!hasExplicitYear) {
            const currentDateLocal = new Date(
              new Date().toLocaleString("en-US", { timeZone: this.timezone })
            );
            dueDate.setFullYear(currentDateLocal.getFullYear());

            if (
              dueDate < currentDateLocal &&
              !inputText.toLowerCase().includes("today")
            ) {
              dueDate.setFullYear(currentDateLocal.getFullYear() + 1);
            }
          }

          task.dueDate = this.#formatDateWithTimezone(dueDate);
        }
      } else {
        task.dueDate =
          task.dueDate.charAt(0).toUpperCase() + task.dueDate.slice(1);
      }
    }

    return task;
  }

  async parseTask(taskText) {
    const currentDate = new Date();
    const basePrompt = this.#getTaskParsingPrompt(currentDate);
    const systemPrompt = `${basePrompt}

Example output:
{
  "title": "Review presentation",
  "assignee": "Sarah",
  "dueDate": "2024-05-29T15:00:00+05:30",
  "priority": "P2",
  "originalDue": "tomorrow at 3pm"
}

IMPORTANT:
1. For day names (e.g., "Wednesday", "Friday"), ALWAYS return just the lowercase day name as dueDate
2. For vague references (e.g., "tonight", "next week"), return the exact phrase in lowercase
3. Only use ISO date format for specific dates and times
4. Never convert day names to actual dates

You must respond with valid JSON containing these exact keys: title, assignee, dueDate, priority, originalDue`;

    const userPrompt = `Parse this task and extract the components according to the guidelines. Current date/time in ${
      this.timezone
    } is: ${currentDate.toLocaleString("en-US", { timeZone: this.timezone })}

Task: "${taskText}"`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content);
      const processedResult = this.#processTaskDate(
        result,
        taskText,
        currentDate
      );

      return {
        success: true,
        data: processedResult,
      };
    } catch (error) {
      console.error("OpenAI task parsing error:", error.message);
      return {
        success: false,
        error: "Failed to parse task",
      };
    }
  }

  async parseTranscript(transcript) {
    const currentDate = new Date();
    const basePrompt = this.#getTaskParsingPrompt(currentDate);
    const systemPrompt = `${basePrompt}

Your job is to extract MULTIPLE tasks from a meeting transcript. Each task should follow the same format and guidelines.

Example input:
"John needs to review the docs by Wednesday. Sarah please finish the design by tomorrow 3pm. Mike urgent task for client meeting tonight."

Example output:
{
  "tasks": [
    {
      "title": "Review the docs",
      "assignee": "John",
      "dueDate": "wednesday",
      "priority": "P3",
      "originalDue": "by Wednesday"
    },
    {
      "title": "Finish the design",
      "assignee": "Sarah",
      "dueDate": "2024-02-21T15:00:00+05:30",
      "priority": "P3",
      "originalDue": "tomorrow 3pm"
    },
    {
      "title": "Client meeting preparation",
      "assignee": "Mike",
      "dueDate": "tonight",
      "priority": "P1",
      "originalDue": "tonight"
    }
  ]
}

IMPORTANT: 
1. For day names (e.g., "Wednesday", "Friday"), ALWAYS return just the lowercase day name as dueDate
2. For vague references (e.g., "tonight", "next week"), return the exact phrase in lowercase
3. Only use ISO date format for specific dates and times
4. Never convert day names to actual dates
5. Always return a valid JSON object with a "tasks" array`;

    const userPrompt = `Extract all tasks from this meeting transcript. Current date/time in ${
      this.timezone
    } is: ${currentDate.toLocaleString("en-US", { timeZone: this.timezone })}

Transcript: "${transcript}"`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content);

      if (!result.tasks || !Array.isArray(result.tasks)) {
        throw new Error("Invalid response format: missing tasks array");
      }

      const processedTasks = result.tasks.map((task) => {
        try {
          return this.#processTaskDate(task, transcript, currentDate);
        } catch (err) {
          throw new Error(`Task processing error: ${err.message}`);
        }
      });

      return {
        success: true,
        data: processedTasks,
      };
    } catch (error) {
      console.error("OpenAI transcript parsing error:", error.message);
      return {
        success: false,
        error: "Failed to parse transcript",
      };
    }
  }
}

module.exports = new OpenAIService();
