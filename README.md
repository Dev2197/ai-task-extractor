# 🚀 Smart Task Manager AI

Transform your natural language inputs into structured tasks effortlessly. Powered by OpenAI, this application understands context, preserves time references, and automatically detects task details from both single inputs and meeting transcripts.

## 🚀 Prerequisites

- Node.js
- npm or yarn
- OpenAI API key

## 💻 Setup & Running Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Run Backend & Frontend**

   You'll need two terminal windows to run the servers:

   **Terminal 1 - Backend Server:**

   ```bash
   cd backend
   npm install

   # Create .env file in backend directory
   # Add your OpenAI API key and port (default 3001)
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001

   # Start the server
   npm run dev
   ```

   **Terminal 2 - Frontend Server:**

   ```bash
   cd client
   npm install

   # Optional: Create .env file in client directory
   # By default, frontend will connect to http://localhost:3001
   VITE_API_URL=http://localhost:3001

   # Start the frontend
   npm run dev
   ```

   The application will be available at:

   - Frontend: `http://localhost:8080`
   - Backend: `http://localhost:3001`


## ✨ Key Features

- **Smart Time Parsing**:
  - Preserves day names (e.g., "Wednesday")
  - Understands vague references (e.g., "tonight", "next week")
  - Handles specific dates and times with timezone awareness
- **Context-Aware Processing**:
  - Automatically detects assignees
  - Identifies task priorities (P1-P4)
  - Extracts due dates and times
- **Meeting Transcript Support**:
  - Parse multiple tasks from meeting notes
  - Maintains context for each task
  - Preserves relationships between tasks and assignees
- **Modern UI/UX**:
  - Beautiful, responsive design
  - Priority-based task organization
  - Smooth scrolling to new tasks
  - Easy task editing and deletion

## 🎯 Example Usage

### Single Task Input

```
Input: "Aman needs to review the landing page design by tomorrow 6pm P1"

Result:
- Title: Review the landing page design
- Assignee: Aman
- Due: Tomorrow at 6:00 PM
- Priority: P1
```

### Meeting Transcript

```
Input:
"Aman you take the landing page by 10pm tomorrow.
Rajeev you take care of client follow-up by Wednesday.
Shreya please review the marketing deck tonight."

Results:
1. Task: Take the landing page
   - Assignee: Aman
   - Due: Tomorrow at 10:00 PM
   - Priority: P3

2. Task: Client follow-up
   - Assignee: Rajeev
   - Due: Wednesday
   - Priority: P3

3. Task: Review the marketing deck
   - Assignee: Shreya
   - Due: Tonight
   - Priority: P3
```

## 🛠️ Technical Stack

- **Frontend**:

  - React with TypeScript
  - TailwindCSS for styling
  - Responsive design

- **Backend**:
  - Node.js/Express
  - OpenAI API integration