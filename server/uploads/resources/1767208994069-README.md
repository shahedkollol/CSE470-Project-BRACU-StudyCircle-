Project Ideas:

Idea 1: BracUStudyCircle -Peer Tutoring and Academic Support System

Software Requirements Specification

Prepared by

Group 11
23101494
Robiul Islam Ashik
23101263
Shahed Parves Kallol
22201743
Jawad Ferdous
22301318
Sumaiya Tasnim Khan

Github Repo Link:
https://github.com/shahedkollol/CSE470-Project-BRACU-StudyCircle-/

1. Purpose
   BRACU Study Circle is a comprehensive academic collaboration platform designed to facilitate peer-to-peer learning, research collaboration, and career development for BRACU students. The system creates a unified ecosystem where students can exchange knowledge through peer tutoring, collaborate on research and thesis projects, access a centralized repository of academic resources and past theses, track post-graduation career outcomes, and connect with peers sharing similar academic interests. The platform serves as a bridge between current students, alumni, and faculty, fostering continuous academic engagement and professional development.
2. Product Perspective
   BRACUStudyCircle operates as a standalone web-based platform integrated within the BRACU academic ecosystem. The system follows a three-tier architecture with a responsive web interface, Node.js/Express backend handling business logic and API endpoints, and MongoDB for flexible data storage. The platform interfaces with email notification systems, cloud storage services for resource hosting, and supports integration with BRACU's existing authentication system.
   User Classes:
   Students: Primary users who tutor, learn, share resources, form thesis groups, and track career progress
   Alumni: Former students who maintain profiles with post-graduation job status and mentor current students
   Faculty: Review thesis submissions, verify resource authenticity, and moderate academic content
   Administrators: Manage platform operations, moderate content, and generate analytics

3. Product Features & Backend Impact
   3.1 Peer Tutoring Module
   Features: Students post tutoring offers or help requests, coordinate sessions through integrated scheduling, rate tutors post-session, and receive AI-powered tutor-student matching based on subject expertise and availability.
   Backend Impact:
   User profile management storing subjects, skills, availability, and tutoring history
   CRUD operations for tutoring posts with advanced search and filtering by subject, department, and rating
   Session request workflow (send, accept, reject, confirm) with calendar conflict detection
   Rating aggregation and tutor performance analytics with leaderboard generation
   Real-time messaging system for tutor-learner communication
   Notification engine for session updates, requests, and reviews
   Favorite tutors tracking for quick rebooking
   3.2 Resource Sharing & Library Module
   Features: Centralized searchable repository of study materials with quality control through ratings and reviews, bookmarking system for personal collections, and AI-driven resource recommendations based on enrolled courses.
   Backend Impact:
   File upload/download management with secure cloud storage integration (Cloudinary)
   Metadata storage (subject, uploader, date, file type, ratings) with full-text search
   CRUD operations for resources with access control and bookmark storage
   Rating and review storage with analytics on the most downloaded/viewed resources
   Data visualization for popular subjects and trending materials
   Content moderation with flagging and reporting workflow
   3.3 Thesis Collaboration Module
   Features: Students create or join thesis groups based on research interests with hierarchical categorization (e.g., Computer Science → AI/ML → Natural Language Processing), receive interest-based matching suggestions, communicate through dedicated group chats, track milestones, and request faculty advisors.

Backend Impact:
Thesis group entity management (creation, member management, status tracking)
Hierarchical interest tagging system with matching algorithm suggesting compatible groups
Group chat message storage and retrieval with real-time capabilities
Milestone and task management with progress tracking
Faculty-student relationship mapping for advisor assignments
Notification system for group invitations, member requests, and advisor responses

3.4 Thesis Repository Module
Features: Digital archive of completed BRACU theses with advanced search by title, author, department, year, and keywords. Faculty members review and verify thesis authenticity with quality ratings. System tracks citation relationships between theses and provides public abstracts with authenticated full-text access.
Backend Impact:
Thesis document storage with comprehensive metadata (author, department, year, supervisor, abstract, keywords)
PDF hosting via cloud storage with URL references and version control
Faculty review workflow (submission → review → approval → publication)
Authenticity rating system with faculty-weighted scoring
Citation relationship database linking referenced theses
Full-text search indexing with access control middleware
Download tracking, analytics, and automated abstract extraction

3.5 Alumni Career Tracking Module
Features: Alumni update employment status, position, and company details with visual career timelines. Analytics show graduate employment by industry and department. Current students connect with alumni for mentorship, job referrals, and career guidance. Featured success story profiles showcase achievements.

Backend Impact:
Alumni profile extension with employment history, current position, company, industry
Career timeline data structure storing job transitions with dates
Industry and company aggregation for analytics dashboards
Mentorship request/offer matching system with notification workflow
Job posting CRUD operations with applicant tracking
Alumni verification workflow and privacy controls for career information visibility
Search functionality for finding alumni by company, industry, or graduation year
Analytics aggregating employment statistics by department, year, and industry
3.6 Study Groups & Events Module
Features: Students create topic-specific or course-specific study groups, schedule study sessions and academic events with RSVP management, view a unified calendar of all academic activities, and share resources within groups.
Backend Impact:
Study group entity management with member roles and permissions
Event creation and management with date, time, location, and capacity tracking
RSVP tracking with confirmation and reminder logic
Calendar data aggregation from multiple sources (sessions, events, group meetings)
Group-specific file storage with access restrictions
Notification scheduling for upcoming events and attendance tracking
3.7 Administration & Moderation Module
Features: Comprehensive admin dashboard for content moderation, user management with role-based access, platform analytics showing usage metrics and trends, report management for flagged content, and data export in CSV/PDF formats.
Backend Impact:
Role-based access control (RBAC) system with admin privileges
Content flagging and reporting workflow with moderation tools
User CRUD operations with soft delete for data retention
Aggregation pipelines for analytics (sessions, resources, thesis submissions)
Report generation algorithms with visualizations and statistics
Data export functionality to CSV/PDF formats
Audit logging for all administrative actions
Dashboard API endpoints serving real-time platform metrics 4. Functional Requirements
4.1 User Management
FR-1.1: Students register with a university email and create profiles, including name, ID, department, interests, skills, and contact information
FR-1.2: Secure authentication via email/password or university SSO integration
FR-1.3: Users update profile,s including tutoring subjects, availability, and privacy settings
FR-1.4: Role-based access (student, alumni, faculty, admin) determines feature availability
FR-1.5: Alumni update post-graduation employment status, including job title, company, industry, and location

4.2 Tutoring System
FR-2.1: Students create tutoring offer posts specifying subject, availability, meeting mode, and rate
FR-2.2: Students create help request posts describing needed topics and preferred schedule
FR-2.3: Search and filter tutoring posts by subject, department, rating, availability, and price
FR-2.4: Send session requests to tutors who can accept or reject with optional messages
FR-2.5: Calendar view displays scheduled tutoring sessions for both tutors and learners
FR-2.6: Rate tutors (1-5 stars) and write reviews after completed sessions
FR-2.7: Leaderboard displays top-rated tutors based on ratings and completed sessions
FR-2.8: Notifications for session requests, confirmations, upcoming sessions, and reviews
FR-2.9: In-platform messaging for session coordination between tutors and learners
FR-2.10: Mark tutors as favorites for quick future access

4.3 Resource Sharing & Library
FR-3.1: Upload study materials (PDFs, documents, presentations) with metadata and tags
FR-3.2: Centralized library with search across titles, descriptions, subjects, and tags
FR-3.3: Rate resources (1-5 stars) and write reviews indicating quality
FR-3.4: Bookmark resources to personal collections for quick access
FR-3.5: Track download and view statistics for each resource
FR-3.6: AI recommendations based on enrolled courses, search history, and bookmarks
FR-3.7: Report inappropriate or low-quality resources to administrators
FR-3.8: Filter by subject, department, resource type, upload date, and rating

4.4 Thesis Collaboration
FR-4.1: Create thesis groups specifying research interests, group size, and member qualifications
FR-4.2: Browse and join existing thesis groups based on compatible interests
FR-4.3: Interest-based matching suggests groups and members based on declared thesis interests
FR-4.4: Hierarchical categorization of thesis interests (e.g., CS → AI/ML → NLP)
FR-4.5: Dedicated group chat functionality for research discussions and coordination
FR-4.6: Track milestones and progress through customizable task lists
FR-4.7: Request faculty advisors with acceptance workflow
FR-4.8: Notifications for member requests, group updates, and milestone completions

4.5 Thesis Repository
FR-5.1: Submit completed theses with PDF, abstract, keywords, and metadata
FR-5.2: Faculty review and approval required before repository publication
FR-5.3: Faculty rate thesis authenticity and quality on a standardized scale
FR-5.4: Advanced search by title, author, department, year, keywords, and research area
FR-5.5: Public abstracts with authenticated full-text access for BRACU users
FR-5.6: Track citation relationships between theses
FR-5.7: Analytics showing most-viewed theses, popular research areas, and citation networks
FR-5.8: Download approved theses in PDF format
FR-5.9: Version control for thesis submissions with faculty approval for updates
FR-5.10: Faculty flag theses for quality concerns or academic integrity issues

4.6 Alumni Career Tracking
FR-6.1: Alumni create employment profiles with job title, company, industry, location, and dates
FR-6.2: Build career timelines showing job progression from graduation
FR-6.3: Analytics dashboards showing graduate employment by department, year, and industry
FR-6.4: Search for alumni by company, industry, position, or graduation year
FR-6.5: Alumni offer mentorship to current students in their field
FR-6.6: Students send mentorship requests with notification and acceptance workflow
FR-6.7: Alumni post job openings or internship opportunities for students
FR-6.8: Privacy controls limit visibility of career information
FR-6.9: Featured success story profiles showcase notable alumni achievements
FR-6.10: Periodic reminders for alumni to update employment status

4.7 Study Groups & Events
FR-7.1: Create study groups for specific courses or topics with optional membership approval
FR-7.2: Schedule study sessions and events with date, time, location, and capacity limits
FR-7.3: Unified calendar view of tutoring sessions, group meetings, and academic events
FR-7.4: RSVP functionality for confirming attendance at scheduled events
FR-7.5: Reminder notifications for upcoming events to confirmed attendees
FR-7.6: Share resources within study groups with member-only access
FR-7.7: Track attendance for completed events to identify active participants

4.8 Administration & Moderation
FR-8.1: Admin CRUD operations for user accounts, including role assignments and deactivation
FR-8.2: Review and moderate flagged content with options to remove, edit, or approve
FR-8.3: Analytics dashboard showing usage metrics, popular subjects, and engagement trends
FR-8.4: Generate and export reports in CSV and PDF formats
FR-8.5: Audit log of all administrative actions for accountability
FR-8.6: Broadcast announcements to all users or specific segments
FR-8.7: Manage reported issues with status tracking and resolution notes
FR-8.8: Faculty tools to moderate thesis submissions and verify resource authenticity

4.9 Notifications & Communication
FR-9.1: Real-time or email notifications for session requests, confirmations, cancellations, and reminders
FR-9.2: Notifications for new reviews or ratings received
FR-9.3: Alerts for thesis group activity, member requests, and milestone updates
FR-9.4: Alumni notifications for mentorship requests and job application responses
FR-9.5: Notification preference settings for customizing types and delivery methods

4.10 Search & Discovery
FR-10.1: Full-text search across tutoring posts, resources, theses, and user profiles
FR-10.2: AI-driven tutor recommendations based on course enrollment and session history
FR-10.3: Resource recommendations based on browsing patterns and bookmarks
FR-10.4: Suggested thesis groups and collaborators based on research interests
FR-10.5: Advanced filtering across all modules by multiple criteria simultaneously

5. Non-Functional Requirements
   Performance:
   Pages load within 2 seconds under normal conditions
   Search queries return results within 1 second for up to 10,000 records
   Support 500 concurrent users without degradation
   Security:
   Password hashing using bcrypt
   Malware scanning for file uploads
   HTTPS for all data transmission
   Session tokens expire after 24 hours of inactivity
   Usability:
   Intuitive interface requiring minimal training
   Clear, actionable error messages

Maintainability:
Industry-standard coding conventions with comprehensive documentation
Modular architecture allowing independent component updates
API versioning for backward compatibility

Environment & Architecture Setup
Goal: Establish development infrastructure and team workflow

Environment Configuration
Set up Node.js, MongoDB, and development tools
Configure Git repository with branching strategy (main, dev, feature branches)
Set up ESLint, Prettier for code standards
Create .env templates for configuration management

Project Architecture
Initialize MERN boilerplate structure
Set up an Express server with basic routing
Configure MongoDB connection and database schemas
Implement JWT-based authentication middleware

Development Workflow
Create project documentation structure
Set up issue tracking and a sprint board
Define the code review process
Establish a daily standup schedule

Deliverables: Working dev environment, basic server running, team workflow established
Layered Structure:
Presentation Layer: React components, UI logic
API Layer: Express routes, request/response handling
Business Logic Layer: Core application logic, algorithms, validations
Data Access Layer: MongoDB operations, ORM/ODM (Mongoose)
Integration Layer: External services (email, cloud storage, notifications)

Workload Distribution Recommendations
Feature-wise distributions (4 members)
Robiul Islam Ashik: Peer Tutoring Module + Resource Sharing
Shahed Parves Kallol: Thesis Collaboration+ Thesis Repository
Jawad Ferdous: User Management + Alumni Tracking
Sumaiya Tasnim Khan: Administration +Study Groups
Full-Stack/Integration Tasks (All members)
Database schema design and MongoDB configuration
API integration and testing
Deployment and DevOps setup
Load Balancing Strategy
Rotate on Resource Sharing & Search/Discovery features
Pair programming for complex features (AI recommendations, matching algorithms)
Weekly code reviews to ensure consistency
Class Diagram:
https://www.mermaidchart.com/app/projects/a5b0f34b-54cc-45a7-b93d-2d8842bc9429/diagrams/dfc1ff9d-8b5d-42d2-ba56-d0bb5f950846/version/v0.1/edit
