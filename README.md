# SnapSpace 

SnapSpace is a modern, minimalist image gallery powered by AI.

## Features Implemented

*   **AI-Powered Auto-Tagging:** When you upload an image, a Genkit-powered AI agent analyzes it to generate relevant tags and a concise caption automatically.
*   **Real-Time Data Sync:** Using Firebase Firestore, all your images, albums, and profile changes are synchronized across devices in real-time.
*   **Secure Authentication:** A full system with Email/Password registration, Login, and Anonymous Guest access. It includes a "Show Password" toggle for better UX.
*   **Advanced Image Management:**
    *   **Lightbox View:** Full-screen preview with metadata editing (Title, Caption, Tags).
    *   **Smart Filtering:** "Recent" view (auto-filtering photos from the last 7 days) and Album-based organization.
    *   **View Modes:** Toggle between Grid and List views.
    *   **Sorting:** Sort by Newest, Oldest, or Name.
    *   **Album System:** Users can create custom albums to categorize their gallery. Deleting an album safely unlinks images without losing them.
*   **Responsive Pro UI:** Built with Shadcn UI and Tailwind CSS, featuring a professional sidebar (collapsible on mobile) and full Dark/Light mode support.

## Tech Stack Overview

*   **Framework:** Next.js 15 (App Router) - Leveraging Server Components for performance and Client Components for interactivity.
*   **Language:** TypeScript - Ensures type safety across the entire data model.
*   **UI & Styling:** Tailwind CSS + Shadcn UI - Provides a modern, accessible, and responsive design system.
*   **Backend & Database:** Firebase Firestore - A NoSQL document database used with a "Path-Based Ownership" model for maximum security.
*   **Authentication:** Firebase Auth - Manages user sessions and secure registration/login.
*   **AI Integration:** Genkit + Gemini 2.5 Flash - Used for multi-modal image analysis and metadata generation.
*   **Icons:** Lucide React - High-quality, consistent iconography.

## Architectural Highlights

*   **Path-Based Ownership:** Data is stored under `/users/{userId}/...`, ensuring that users can only ever access their own data via strictly enforced Firestore Security Rules.
*   **Non-Blocking Mutations:** The app uses optimistic UI patterns (non-blocking writes) so that uploads and edits feel instantaneous to the user.
