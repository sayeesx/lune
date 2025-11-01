Goal

Implement persistent conversation memory and live chat synchronization between the Node.js AI API, Supabase database, and Expo React Native app (for both aidoctor.tsx and chat-history/[id].tsx).

Current Setup

The AI Doctor chat uses a Node.js API connected to Groq API for generating responses.

The Expo app communicates with both:

Supabase (for storing chat messages and history)

Node.js API (for AI responses)

Supabase and Node.js are not directly connected.

The page [id].tsx correctly fetches specific chat history but does not have real-time updates.

Each time the user replies, the Node.js API starts a new chat, losing the previous conversation context.

Issues to Fix

Conversation context is lost — the AI starts from scratch every time.

No real-time updates — [id].tsx does not automatically refresh when new messages are added.

Supabase and Node.js are disconnected — causing inconsistent chat state between backend and app.

Expected Behavior
🔹 aidoctor.tsx (Main Chat Page)

Maintain a single conversation session per user or chat ID.

When the user sends a message:

Save it to Supabase (messages table) immediately.

Send the same message (and conversation history so far) to the Node.js API.

The Node.js API should use the full conversation context for coherent responses.

Display the AI’s response in the app and store it back in Supabase.

The “Stop” button should instantly halt the ongoing response generation but still allow typing in the input (just prevent sending new messages until stopped).

Keep the existing minimal theme, same animations, and original PNG color for the “Go Back” button.

🔹 chat-history/[id].tsx (Chat History Page)

Copy the exact layout, theme, and animations from aidoctor.tsx.

Show previous conversations (fetched from Supabase) using the id param.

Allow users to continue chatting in the same thread — new messages should:

Append to Supabase for that same chat ID.

Continue the context seamlessly with the Node.js API.

Enable real-time updates via Supabase’s live subscription:

Whenever a new message or response is inserted, the UI updates instantly (no manual refresh).

Replace any loading spinner with a skeleton shimmer effect for a smooth loading experience.

How to Fix It (Conceptually)

Conversation Context (Node.js Side):

Store messages temporarily in memory or a lightweight Redis cache (keyed by chat ID).

Every new message should send both the latest user input and previous messages (from cache or DB) to Groq API.

The API response should append to that conversation session.

Database Sync (Supabase Side):

When the Node.js API gets or generates a new message, it should write the message into Supabase via its REST or RPC endpoint.

This ensures both Node.js and Supabase remain synchronized.

The app listens to Supabase real-time changes and updates the chat UI instantly.

Front-End Real-Time Update:

In [id].tsx, enable Supabase real-time listener for that chat ID.

When a new message (either user or AI) is added to the database, the chat UI should automatically refresh.

Session Persistence:

Each chat has a unique chat ID stored in Supabase.

Use this ID across both aidoctor.tsx and [id].tsx to ensure context continuity.

Expected Result

✅ AI continues the conversation contextually (no reset).
✅ Old conversations load instantly in [id].tsx.
✅ Real-time message sync between all chat instances.
✅ “Stop” button works smoothly without blocking input typing.
✅ Consistent UI, layout, and animations across all chat-related screens.