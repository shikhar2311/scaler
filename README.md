# LeetCode Assistant

LeetCode Assistant is an interactive chat application designed to help users with coding problems, particularly those from LeetCode. The application allows users to paste LeetCode problem URLs or ask general coding questions, and receive helpful, contextual assistance.


## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Usage Guidelines](#usage-guidelines)
  - [Working with LeetCode Problems](#working-with-leetcode-problems)
  - [Asking General Coding Questions](#asking-general-coding-questions)
- [AI Integration Details](#ai-integration-details)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Features

- **LeetCode Problem Integration**: Paste a LeetCode URL to automatically load problem details
- **Interactive Chat Interface**: Communicate with the AI assistant in a familiar chat format
- **Code Highlighting**: Proper formatting and syntax highlighting for code examples
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**:
  - React.js
  - CSS3 with CSS Variables for theming
  - React Markdown for rendering markdown content

- **Backend**:
  - Node.js with Express
  - Google Generative AI (Gemini) API

## Architecture

The application follows a client-server architecture:

1. **Client** (React.js):
   - Manages UI state and user interactions
   - Sends user messages to the backend
   - Renders AI responses with proper formatting
   - Handles LeetCode problem context storage

2. **Server** (Node.js/Express):
   - Processes incoming requests from the client
   - Communicates with the Google Generative AI API
   - Transforms data between client format and AI API format
   - Manages API keys and configuration

```
┌─────────────┐     HTTPS     ┌─────────────┐    API Calls   ┌─────────────────┐
│             │◄------------►│             │◄-------------►│                 │
│  React.js   │     JSON      │  Express.js │    JSON        │ Google Generative│
│  Frontend   │               │  Backend    │                │ AI (Gemini)     │
│             │               │             │                │                 │
└─────────────┘               └─────────────┘                └─────────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Google Generative AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/leetcode-assistant.git
   cd leetcode-assistant
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

### Environment Variables

1. Create a `.env` file in the `server` directory:
   ```bash
   cd ../server
   touch .env
   ```

2. Add your Google Generative AI API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=8000
   ```

### Running the Application

1. Start the server:
   ```bash
   # From the server directory
   npm start
   ```

2. In a separate terminal, start the client:
   ```bash
   # From the client directory
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage Guidelines

### Working with LeetCode Problems

1. **Load a LeetCode Problem**:
   - Copy a LeetCode problem URL (e.g., `https://leetcode.com/problems/two-sum/`)
   - Paste it into the input field and press Enter or click Send
   - The application will load the problem details automatically

2. **Ask Specific Questions**:
   - After loading a problem, you can ask specific questions about it
   - Example: "Can you explain the dynamic programming approach for this problem?"
   - Example: "What's the time complexity of the optimal solution?"

3. **Request Code Solutions**:
   - Ask for implementation guidance or full solutions
   - Example: "Can you show me a Python solution using a hash map?"
   - Example: "How would I optimize this approach to improve space complexity?"

### Asking General Coding Questions

Even without a specific LeetCode problem loaded, you can:

1. **Ask about Data Structures & Algorithms**:
   - Example: "Explain how quicksort works"
   - Example: "What's the difference between a heap and a priority queue?"

2. **Get Programming Language Help**:
   - Example: "How do I use list comprehensions in Python?"
   - Example: "Explain JavaScript closures with examples"

3. **Learn about Coding Concepts**:
   - Example: "What is dynamic programming?"
   - Example: "Explain Big O notation with examples"

## AI Integration Details

The application uses Google's Generative AI (Gemini) for intelligent responses:

1. **Request Flow**:
   - User messages are captured by the React frontend
   - Messages are sent to the Node.js backend through a POST request to `/api/chat`
   - The backend formats the request for the Gemini API
   - Responses from Gemini are transformed to match the expected frontend format
   - The frontend renders the response with proper formatting

2. **Contextual Awareness**:
   - The application maintains conversation history to provide context for the AI
   - When a LeetCode problem is loaded, its details are included in the context
   - This allows the AI to provide more relevant, problem-specific guidance

3. **Model Configuration**:
   - The application uses the `gemini-1.5-pro` model
   - Temperature is set to 0.7 for a balance between creativity and accuracy
   - Maximum output token limit is 1000 to ensure comprehensive responses

4. **Response Formatting**:
   - AI responses are rendered with React Markdown
   - This enables proper formatting of:
     - Code blocks with syntax highlighting
     - Lists and tables
     - Emphasis (bold, italic)
     - And other markdown elements

## Customization

You can customize various aspects of the application:

1. **UI Theming**:
   - Edit the CSS variables in `client/src/index.css` to change colors and styles
   - Modify dark/light mode themes by adjusting the CSS variables

2. **AI Behavior**:
   - Adjust the temperature setting in `server.js` to change response creativity
   - Modify `maxOutputTokens` to change response length

3. **Adding Features**:
   - The modular architecture makes it easy to add new capabilities
   - Extend the backend to support additional API endpoints
   - Add new UI components in React as needed
