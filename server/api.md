# BRACU Study Circle API Documentation

All endpoints are prefixed with `/api`.

---

## User Authentication & Management

### Register User

- **Method:** POST
- **Route:** `/api/users/register`
- **Description:** Register a new user (student, alumni, faculty, admin).
- **Example Request:**

```http
POST /api/users/register
Content-Type: application/json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "pass1234",
  "department": "CSE",
  "batch": "Spring25"
}
```

- **Example Response:**

```json
201 Created
{
  "message": "Registered successfully ✅",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student",
    "department": "CSE",
    "batch": "Spring25"
  }
}
```

### Login User

- **Method:** POST
- **Route:** `/api/users/login`
- **Description:** Login and receive JWT token.
- **Example Request:**

```http
POST /api/users/login
Content-Type: application/json
{
  "email": "alice@example.com",
  "password": "pass1234"
}
```

- **Example Response:**

```json
200 OK
{
  "message": "Login successful ✅",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student",
    "department": "CSE",
    "batch": "Spring25"
  }
}
```

### Auth Routes (aliases)

- **Routes:** `/api/auth/register`, `/api/auth/login`
- **Description:** The routes under `/api/auth` are mounted in the application and act as aliases for `/api/users/register` and `/api/users/login`. They provide the same request/response contracts shown above. Documented here for clarity; prefer using `/api/users/*` in examples to keep a single canonical path.

  - **Example:**

  ```http
  POST /api/auth/register
  Content-Type: application/json
  {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "pass1234",
    "department": "CSE",
    "batch": "Spring25"
  }
  ```

---

## Study Groups

### List Study Groups

- **Method:** GET
- **Route:** `/api/study-groups`
- **Description:** Get all study groups.
- **Example Request:**

```http
GET /api/study-groups
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "title": "CSE470",
    "course": "CSE470",
    "creatorName": "Alice",
    "members": ["Alice"],
    "status": "active"
  }
]
```

### Create Study Group

- **Method:** POST
- **Route:** `/api/study-groups`
- **Description:** Create a new study group.
- **Example Request:**

```http
POST /api/study-groups
Content-Type: application/json
{
  "title": "CSE470",
  "course": "CSE470",
  "creatorName": "Alice"
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "title": "CSE470",
  "course": "CSE470",
  "creatorName": "Alice",
  "members": ["Alice"],
  "status": "active"
}
```

---

## Tutoring

### List Tutoring Posts

- **Method:** GET
- **Route:** `/api/tutoring/posts?subject=math`
- **Description:** Get all tutoring posts, optionally filter by subject.
- **Example Request:**

```http
GET /api/tutoring/posts?subject=math
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "author": { "_id": "...", "name": "Alice" },
    "subject": "Math",
    "description": "Help with calculus",
    "availability": ["Monday"],
    "meetingMode": "ONLINE",
    "rate": 10,
    "postType": "OFFER"
  }
]
```

### Create Tutoring Post

- **Method:** POST
- **Route:** `/api/tutoring/posts`
- **Description:** Create a new tutoring post.
- **Example Request:**

```http
POST /api/tutoring/posts
Content-Type: application/json
{
  "author": "<userId>",
  "subject": "Math",
  "description": "Help with calculus",
  "availability": ["Monday"],
  "meetingMode": "ONLINE",
  "rate": 10,
  "postType": "OFFER"
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "author": "<userId>",
  "subject": "Math",
  "description": "Help with calculus",
  "availability": ["Monday"],
  "meetingMode": "ONLINE",
  "rate": 10,
  "postType": "OFFER"
}
```

### Tutoring Sessions

- **List Sessions:**

  - **Method:** GET
  - **Route:** `/api/tutoring/sessions`
  - **Description:** Get all scheduled tutoring sessions.

  - **Example Response:**

  ```json
  200 OK
  [
    {
      "_id": "...",
      "tutor": { "_id": "...", "name": "Alice" },
      "learner": { "_id": "...", "name": "Bob" },
      "subject": "CSE101",
      "scheduledTime": "2025-12-20T10:00:00.000Z",
      "location": "Room 12",
      "status": "PENDING"
    }
  ]
  ```

- **Create Session:**

  - **Method:** POST
  - **Route:** `/api/tutoring/sessions`
  - **Description:** Schedule a tutoring session.

  - **Example Request:**

  ```http
  POST /api/tutoring/sessions
  Content-Type: application/json
  {
    "tutor": "<userId>",
    "learner": "<userId>",
    "subject": "CSE101",
    "scheduledTime": "2025-12-20T10:00:00Z",
    "location": "Room 12"
  }
  ```

  - **Example Response:**

  ```json
  201 Created
  {
    "_id": "...",
    "tutor": "<userId>",
    "learner": "<userId>",
    "subject": "CSE101",
    "scheduledTime": "2025-12-20T10:00:00Z",
    "location": "Room 12",
    "status": "PENDING"
  }
  ```

---

## Thesis Collaboration & Repository

### Create Thesis Group

- **Method:** POST
- **Route:** `/api/thesis/groups`
- **Description:** Create a new thesis group.
- **Example Request:**

```http
POST /api/thesis/groups
Content-Type: application/json
{
  "groupName": "NLP Research",
  "leader": "<userId>",
  "researchInterests": ["AI", "NLP"]
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "groupName": "NLP Research",
  "leader": "<userId>",
  "researchInterests": ["AI", "NLP"],
  "members": ["<userId>"]
}
```

### Join Thesis Group

- **Method:** PUT
- **Route:** `/api/thesis/groups/:id/join`
- **Description:** Join a thesis group by ID. Send `{ "userId": "<userId>" }` in the request body.

  - **Example Request:**

  ```http
  PUT /api/thesis/groups/:id/join
  Content-Type: application/json
  {
    "userId": "<userId>"
  }
  ```

  - **Example Response:**

  ```json
  200 OK
  {
    "_id": "...",
    "members": ["<userId>", "<userId2>"],
    "leader": "<userId>"
  }
  ```

### Search Theses

- **Method:** GET
- **Route:** `/api/thesis/repository/search?keyword=Paper`
- **Description:** Search published theses by keyword.
- **Example Request:**

```http
GET /api/thesis/repository/search?keyword=Paper
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "title": "Paper",
    "status": "PUBLISHED"
  }
]
```

**Note:** `searchThesis` uses a MongoDB `$text` query. Create a text index on the `Thesis` fields you want searchable (e.g., `title`, `abstract`, `keywords`) for this endpoint to work as expected.

---

## Resource Library

### List Resources

- **Method:** GET
- **Route:** `/api/resources?subject=math&tag=calculus`
- **Description:** Get all resources, filter by subject/tag.
- **Example Request:**

```http
GET /api/resources?subject=math&tag=calculus
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "title": "Calculus Notes",
    "fileUrl": "https://...",
    "subject": "Math",
    "tags": ["calculus"],
    "viewCount": 10,
    "downloadCount": 5
  }
]
```

### Create Resource

- **Method:** POST
- **Route:** `/api/resources`
- **Description:** Upload a new resource (provide fileUrl for MVP).
- **Example Request:**

```http
POST /api/resources
Content-Type: application/json
{
  "title": "Calculus Notes",
  "fileUrl": "https://...",
  "subject": "Math",
  "tags": ["calculus"]
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "title": "Calculus Notes",
  "fileUrl": "https://...",
  "subject": "Math",
  "tags": ["calculus"]
}
```

### Bookmark Resource

- **Method:** POST
- **Route:** `/api/resources/:id/bookmark`
- **Description:** Bookmark a resource for a user.
- **Example Request:**

```http
POST /api/resources/123/bookmark
Content-Type: application/json
{
  "userId": "<userId>"
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "user": "<userId>",
  "resource": "123"
}
```

### Resource: Update / Delete / View / Download / Bookmarks

- **Update Resource:**

  - **Method:** PUT
  - **Route:** `/api/resources/:id`
  - **Description:** Update resource metadata (title, tags, subject, etc.).

- **Delete Resource:**

  - **Method:** DELETE
  - **Route:** `/api/resources/:id`
  - **Description:** Remove a resource.

- **Increment View Count:**

  - **Method:** POST
  - **Route:** `/api/resources/:id/view`
  - **Description:** Increment view count (used by client when resource is viewed).

- **Increment Download Count:**

  - **Method:** POST
  - **Route:** `/api/resources/:id/download`
  - **Description:** Increment download counter (used by client when resource is downloaded).

- **List Bookmarks for a User:**

  - **Method:** GET
  - **Route:** `/api/resources/bookmarks/:userId`
  - **Description:** Get all bookmarks for a given user (populates resource details).

- **Remove Bookmark:**

  - **Method:** DELETE
  - **Route:** `/api/resources/:id/bookmark`
  - **Description:** Remove a bookmark for a user (send `{ "userId": "..." }` in body).

---

## Events

### List Events

- **Method:** GET
- **Route:** `/api/events`
- **Description:** Get all scheduled events.
- **Example Request:**

```http
GET /api/events
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "title": "Study Session",
    "dateTime": "2025-12-20T18:00:00Z",
    "location": "Room 101",
    "attendees": ["<userId>"]
  }
]
```

### RSVP to Event

- **Method:** POST
- **Route:** `/api/events/:id/rsvp`
- **Description:** RSVP to an event.
- **Example Request:**

```http
POST /api/events/123/rsvp
Content-Type: application/json
{
  "userId": "<userId>"
}
```

- **Example Response:**

```json
200 OK
{
  "_id": "123",
  "attendees": ["<userId>"]
}
```

### Cancel RSVP

- **Method:** POST
- **Route:** `/api/events/:id/cancel`
- **Description:** Cancel an RSVP. Send `{ "userId": "<userId>" }` in the request body.

  - **Example Response:**

  ```json
  200 OK
  {
    "_id": "123",
    "attendees": []
  }
  ```

---

## Admin

### List Users

- **Method:** GET
- **Route:** `/api/admin/users`
- **Description:** List all users (admin only).
- **Example Request:**

```http
GET /api/admin/users
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student"
  }
]
```

### Update User Role

- **Method:** PUT
- **Route:** `/api/admin/users/:id/role`
- **Description:** Update a user's role (admin only).
- **Example Request:**

```http
PUT /api/admin/users/123/role
Content-Type: application/json
{
  "role": "admin"
}
```

- **Example Response:**

```json
200 OK
{
  "_id": "123",
  "role": "admin"
}
```

**Note:** Valid role values are: `student`, `alumni`, `faculty`, `admin`. The API will reject other values.

### Delete User

- **Method:** DELETE
- **Route:** `/api/admin/users/:id`
- **Description:** Delete a user (admin only).
- **Example Request:**

```http
DELETE /api/admin/users/123
```

- **Example Response:**

```json
200 OK
{
  "message": "User deleted"
}
```

---

## Community (Jobs & Mentorship)

### List Jobs

- **Method:** GET
- **Route:** `/api/community/jobs`
- **Description:** List all job postings.
- **Example Request:**

```http
GET /api/community/jobs
```

- **Example Response:**

```json
200 OK
[
  {
    "_id": "...",
    "title": "TA role",
    "company": "BRACU"
  }
]
```

### Create Job

- **Method:** POST
- **Route:** `/api/community/jobs`
- **Description:** Create a new job posting.
- **Example Request:**

```http
POST /api/community/jobs
Content-Type: application/json
{
  "title": "TA role",
  "company": "BRACU",
  "description": "Assist"
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "title": "TA role",
  "company": "BRACU",
  "description": "Assist"
}
```

### Request Mentorship

- **Method:** POST
- **Route:** `/api/community/mentorship`
- **Description:** Request mentorship from alumni.
- **Example Request:**

```http
POST /api/community/mentorship
Content-Type: application/json
{
  "student": "<userId>",
  "alumni": "<userId>",
  "message": "Can you help with thesis?"
}
```

- **Example Response:**

```json
201 Created
{
  "_id": "...",
  "student": "<userId>",
  "alumni": "<userId>",
  "message": "Can you help with thesis?"
}
```
