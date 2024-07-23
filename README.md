# LoopAI: Your Intelligent Note-Taking Assistant

![LoopAI Logo](public/LoopLogoFinal.png)

LoopAI is a cutting-edge note-taking application that leverages artificial intelligence to revolutionize your personal and professional organization. By integrating seamlessly with multiple Gmail inboxes and utilizing advanced AI capabilities, LoopAI acts as an intelligent chatbot, helping you manage your notes and emails effortlessly.

## Features

- 🤖 **AI-Powered Chatbot**: Interact naturally with your notes and emails using Claude AI.
- 📧 **Multi-Inbox Gmail Integration**: Sync and manage multiple Gmail inboxes within the app.
- 📝 **Smart Note-Taking**: Organize and retrieve your notes with ease.
- 🔍 **Intelligent Search**: Find exactly what you need across notes and emails.
- 🎨 **Beautiful UI**: Enjoy a sleek, intuitive interface designed for productivity using shadcn UI.
- 🧠 **Advanced AI Capabilities**: Powered by Vercel AI SDK and Claude Connect API.
- 🔗 **Vector Embeddings**: Utilize Pinecone DB for efficient similarity search and information retrieval.
- 🔐 **Secure User Management**: Robust authentication and session management with Clerk.js.

## Demo

[Watch LoopAI in Action](https://youtube.com/your_demo_video)

![LoopAI Demo GIF](path/to/your/demo.gif)

*For a more detailed walkthrough of LoopAI's features, check out our [YouTube demo](https://youtube.com/your_demo_video).*

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Gmail account(s)
- MongoDB database
- Claude API key
- Pinecone API key
- Clerk.js account

### Installation

1. Clone the repository:
2. Navigate to the project directory:
3. Install dependencies:
or
4. Set up environment variables:
Create a `.env.local` file in the root directory and add your configuration:
DATABASE_URL=your_mongodb_connection_string
NEXT_PUBLIC_GMAIL_CLIENT_ID=your_gmail_client_id
NEXT_PUBLIC_GMAIL_CLIENT_SECRET=your_gmail_client_secret
CLAUDE_API_KEY=your_claude_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
5. Run the development server:
or
6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Usage

1. Sign up or log in using Clerk.js authentication.
2. Connect your primary Gmail account and grant necessary permissions.
3. Add additional Gmail inboxes if desired.
4. Start taking notes or ask LoopAI to fetch information from your emails across all synced inboxes.
5. Enjoy a seamless, AI-enhanced note-taking experience powered by Claude AI!

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Claude Connect API](https://www.anthropic.com)
- [Prisma](https://www.prisma.io/)
- [MongoDB](https://www.mongodb.com/)
- [Pinecone](https://www.pinecone.io/)
- [Clerk](https://clerk.dev/)
- [shadcn UI](https://ui.shadcn.com/)

## Technical Stack

LoopAI is built with a robust and modern tech stack:

- **Frontend**: Next.js with React and TypeScript for a type-safe, performant user interface.
- **UI Components**: shadcn UI for beautifully designed, accessible components.
- **Backend**: Next.js API routes with TypeScript for server-side logic.
- **Database**: MongoDB with Prisma ORM for efficient data management and type-safe database queries.
- **Authentication**: Clerk.js for secure, feature-rich user management and authentication.
- **AI and Data Processing**:
- Vercel AI SDK for integrating AI capabilities.
- Claude Connect API for advanced natural language processing.
- Pinecone DB for storing and querying vector embeddings.
- **Email Integration**: Custom Gmail API integration for syncing multiple inboxes.

This stack ensures a scalable, maintainable, and high-performance application capable of handling complex AI-driven tasks and multi-account email management.


Made with ❤️ by Lakshya Singh

[![https://x.com/Lakshyaa_22](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/your_twitter_handle)