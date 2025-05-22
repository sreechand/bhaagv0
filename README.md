# Bhaag-V0

BHAAG is a Next.js-based web application that leverages AI to create personalized running and strength training plans. The system integrates Supabase for backend services and OpenAI for plan generation, providing users with structured, adaptive training programs based on their goals and preferences. The application follows a hierarchical data model, organizing training content into plans, weeks, and individual sessions for a comprehensive user experience.



**Key Components:**

Next.js Frontend: Provides the user interface and client-side functionality
API Routes: Server-side endpoints handling data processing and external service communication
Supabase Backend: Manages authentication, database operations, and file storage
OpenAI Integration: Powers the AI-driven plan generation system


BHAAG integrates with two primary external services:

**Supabase**

Authentication: Manages user sessions and identity
Database: Stores user profiles, training plans, and workout data
Storage: Handles file storage (e.g., user avatars)


**OpenAI**

Provides the AI model (GPT-4 Turbo) used for generating personalized training plans
Processes structured prompts to create detailed, adaptive training schedules
Returns JSON-formatted plan data that is parsed and stored in the database

**Growth School**

Developed as part of the Build W/ AI program by Growth School
By Manish, Sandeep, Sreechand, Abhisehk
