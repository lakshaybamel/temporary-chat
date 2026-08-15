<div align="center">

<img src="src/main/resources/static/images/logo.png" alt="Fleeting Logo" width="110"/>

# Fleeting

### Temporary chat. Share files. Leave no permanent trail.

A lightweight, anonymous, room-based chat and file-sharing application built with Spring Boot, WebSocket, PostgreSQL, and Supabase Storage.

<p>
  <a href="https://fleeting-yo6v.onrender.com">Live Demo</a> •
  <a href="https://github.com/lakshaybamel/temporary-chat">GitHub Repository</a>
</p>

![Java](https://img.shields.io/badge/Java-22-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-6C63FF?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square)

</div>

---

## 📖 Overview

**Fleeting** is a temporary, anonymous communication platform designed for situations where you want to quickly create a private room, share a link or QR code, chat in real time, and exchange files without creating an account.

A room is created with a unique six-character join code and remains active for **24 hours**. Users can join using the code, room URL, or QR code.

There is:

- No registration
- No login
- No permanent user profile
- No password required
- No permanent chat identity

Users are assigned a temporary guest name for identifying their messages inside a room.

---

## ✨ Features

### 🏠 Room Management

- Create a room with a custom room name
- Generate a unique 6-character room code
- Join an existing room using a room code
- Share rooms using a direct URL
- Generate a QR code for quick joining
- 24-hour room lifetime
- Live room-expiration countdown
- Automatic validation of room status

### 💬 Real-Time Chat

- Anonymous guest messaging
- Real-time message delivery using WebSocket/STOMP
- Previous messages are loaded when joining an existing room
- Room-isolated conversations
- IST (Asia/Kolkata) message timestamps
- Copy button for text messages
- Automatic scrolling to the latest message

### 🧑‍💻 Code & Multiline Messages

The chat composer supports developer-friendly message formatting:

- `Enter` sends the message
- `Shift + Enter` creates a new line
- Newlines, tabs, and spaces are preserved
- Long messages use an auto-growing composer
- Long pasted code becomes internally scrollable
- Message formatting is preserved when copying

### 📁 File Sharing

- Upload files directly inside a room
- File metadata is stored with the message
- Files are stored using Supabase Storage
- Configurable upload limit
- File name and size displayed in the chat
- Download files directly instead of opening them in a new tab
- Files are isolated by room

### 🎨 Modern UI

- Modern dark theme
- Responsive home page
- Create Room and Join Room interfaces
- Features, How It Works, About, FAQ, and Contact sections
- Responsive chat-room layout
- Mobile-friendly message composer
- Fleeting branding and custom visual assets

---

## 🧩 How It Works

```text
                         FLEETING
                            │
                ┌───────────┴───────────┐
                │                       │
          CREATE ROOM               JOIN ROOM
                │                       │
         Enter room name          Enter room code
                │                       │
                ▼                       ▼
        Generate unique code     Validate active room
                │                       │
          Generate QR code              │
                │                       │
                └───────────┬───────────┘
                            ▼
                       CHAT ROOM
                            │
                ┌───────────┴───────────┐
                │                       │
           Text Messages           File Sharing
                │                       │
                ▼                       ▼
          PostgreSQL DB           Supabase Storage
                │                       │
                └───────────┬───────────┘
                            ▼
                       24 HOURS
                            │
                            ▼
                     Room Expires
```

---

## 🏗️ Architecture

Fleeting follows a simple client-server architecture.

```text
┌──────────────────────────────┐
│          Browser             │
│                              │
│ HTML + CSS + JavaScript      │
│ STOMP.js / WebSocket         │
└──────────────┬───────────────┘
               │
       REST + WebSocket
               │
               ▼
┌──────────────────────────────┐
│       Spring Boot            │
│                              │
│ Controllers                  │
│ Services                     │
│ JPA / Hibernate              │
│ WebSocket Message Broker     │
└────────────┬───────┬─────────┘
             │       │
             │       │ Supabase Storage API
             │       ▼
             │  ┌───────────────┐
             │  │ Supabase      │
             │  │ Storage       │
             │  │ chat-files    │
             │  └───────────────┘
             │
             ▼
      ┌────────────────┐
      │ Supabase       │
      │ PostgreSQL     │
      └────────────────┘
```

### Communication

**REST APIs** are used for:

- Room creation
- Room validation
- Room/message retrieval
- QR code generation
- File upload
- File download URL generation

**WebSocket/STOMP** is used for:

- Real-time chat messages
- Room-specific message broadcasting

The frontend dynamically uses `ws://` locally and `wss://` when running over HTTPS.

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Java 22 | Programming language |
| Spring Boot 4.1.0 | Backend framework |
| Spring Web | REST APIs |
| Spring WebSocket | Real-time communication |
| Spring Data JPA | Database access |
| Hibernate | ORM |
| PostgreSQL | Relational database |
| Maven | Build and dependency management |
| ZXing | QR code generation |

### Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive UI |
| JavaScript | Client-side logic |
| STOMP.js | WebSocket messaging |

### Cloud & Deployment

| Technology | Purpose |
|---|---|
| Supabase PostgreSQL | Production database |
| Supabase Storage | File/object storage |
| Render | Production hosting |
| Docker | Containerized deployment |

---

## 📂 Project Structure

```text
temporary-chat/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/chat/
│       │       ├── config/
│       │       │   ├── SupabaseStorageConfig.java
│       │       │   └── WebSocketConfig.java
│       │       │
│       │       ├── controller/
│       │       │   └── RoomController.java
│       │       │
│       │       ├── dto/
│       │       │   └── CreateRoomRequest.java
│       │       │
│       │       ├── entity/
│       │       │   ├── Message.java
│       │       │   ├── MessageType.java
│       │       │   ├── Room.java
│       │       │   └── RoomStatus.java
│       │       │
│       │       ├── exception/
│       │       │   ├── RoomExpiredException.java
│       │       │   └── RoomNotFoundException.java
│       │       │
│       │       ├── repository/
│       │       │   ├── MessageRepository.java
│       │       │   └── RoomRepository.java
│       │       │
│       │       ├── service/
│       │       │   ├── FileDownloadService.java
│       │       │   ├── FileUploadService.java
│       │       │   └── RoomService.java
│       │       │
│       │       └── TemporaryChatApplication.java
│       │
│       └── resources/
│           ├── static/
│           │   ├── css/
│           │   │   ├── room.css
│           │   │   └── style.css
│           │   │
│           │   ├── images/
│           │   │   ├── logo.png
│           │   │   └── poster.png
│           │   │
│           │   ├── js/
│           │   │   ├── app.js
│           │   │   └── room.js
│           │   │
│           │   ├── index.html
│           │   └── room.html
│           │
│           ├── templates/
│           └── application.properties
│
├── Dockerfile
├── pom.xml
└── README.md
```

---

## 🗄️ Database Design

Fleeting currently uses two primary application tables.

### `rooms`

```text
id
name
join_code
created_at
expires_at
status
```

### `messages`

```text
id
room_id
message_type
content
sender_name
file_name
file_path
file_size
mime_type
created_at
```

Text and file messages are represented through the `messages` table. File-specific metadata is stored with file messages while the actual file content is stored in Supabase Storage.

---

## 🔄 Message Flow

```text
User types message
       │
       ▼
Frontend validates input
       │
       ▼
STOMP publish
       │
       ▼
/app/chat/{joinCode}
       │
       ▼
Spring Boot
       │
       ├── Save message
       │
       └── Broadcast
              │
              ▼
     /topic/room/{joinCode}
              │
              ▼
      All users in room
```

---

## 📤 File Upload Flow

```text
Select file
    │
    ▼
Frontend creates FormData
    │
    ▼
POST /api/rooms/{joinCode}/files
    │
    ▼
Spring Boot
    │
    ├── Validate room
    │
    ├── Upload file to Supabase Storage
    │
    └── Save file metadata as a message
              │
              ▼
       WebSocket broadcast
              │
              ▼
        File appears in chat
```

### File Download Flow

```text
Click Download
      │
      ▼
GET /api/rooms/{joinCode}/files/{messageId}
      │
      ▼
Backend generates temporary signed URL
      │
      ▼
Frontend fetches the signed URL
      │
      ▼
Blob + temporary download link
      │
      ▼
File downloaded with original filename
```

---

## 🔐 Configuration

Create environment variables for the database and Supabase credentials.

### Required variables

```env
DB_HOST=your-supabase-db-host
DB_PORT=6543
DB_NAME=postgres
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

APP_BASE_URL=http://localhost:8080
```

For Render production:

```env
APP_BASE_URL=https://fleeting-yo6v.onrender.com
```

The application also supports:

```env
PORT=8080
```

Render provides `PORT` automatically in production.

> **Never commit database passwords, Supabase service keys, or other secrets to GitHub.**

---

## ⚙️ Application Configuration

The application uses environment variables rather than hard-coded production credentials.

Important settings include:

```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1

spring.jpa.hibernate.ddl-auto=update

server.port=${PORT:8080}

app.base-url=${APP_BASE_URL:http://localhost:8080}

supabase.url=${SUPABASE_URL}
supabase.service-key=${SUPABASE_SERVICE_KEY}
supabase.storage.bucket=chat-files

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

For the production Supabase transaction pooler, the application also disables PostgreSQL server-side prepared statements:

```properties
spring.datasource.hikari.data-source-properties.prepareThreshold=0
```

---

## 🚀 Run Locally

### Prerequisites

Install:

- Java 22
- Maven
- PostgreSQL/Supabase database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/lakshaybamel/temporary-chat.git
cd temporary-chat
```

### 2. Configure environment variables

Set the required database and Supabase variables in your IDE or environment.

Do not place production credentials directly inside `application.properties`.

### 3. Run the application

Using Maven:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Or run:

```text
TemporaryChatApplication
```

from IntelliJ IDEA.

### 4. Open Fleeting

```text
http://localhost:8080
```

---

## 🐳 Run with Docker

Build the image:

```bash
docker build -t fleeting .
```

Run the container:

```bash
docker run -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=6543 \
  -e DB_NAME=postgres \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e SUPABASE_URL=your-supabase-url \
  -e SUPABASE_SERVICE_KEY=your-service-key \
  -e APP_BASE_URL=http://localhost:8080 \
  fleeting
```

Then open:

```text
http://localhost:8080
```

---

## ☁️ Deployment

Fleeting is deployed using **Render** with Docker.

### Production architecture

```text
GitHub
   │
   ▼
Render
   │
   ▼
Docker Container
   │
   ├──────────────► Supabase PostgreSQL
   │
   └──────────────► Supabase Storage
```

### Production URL

**https://fleeting-yo6v.onrender.com**

### Render Environment Variables

Configure the same required variables in the Render service:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
SUPABASE_URL
SUPABASE_SERVICE_KEY
APP_BASE_URL
```

The production service uses the Supabase transaction pooler and a small Hikari connection pool to stay within the available database connection limits.

---

## 🔌 Main API & WebSocket Routes

### REST

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/rooms` | Create a room |
| `GET` | `/api/rooms/{joinCode}` | Get/validate an active room |
| `GET` | `/api/rooms/{joinCode}/qr` | Generate room QR code |
| `POST` | `/api/rooms/{joinCode}/files` | Upload a file |
| `GET` | `/api/rooms/{joinCode}/files/{messageId}` | Generate a file download URL |

### WebSocket

WebSocket endpoint:

```text
/ws
```

Room subscription:

```text
/topic/room/{joinCode}
```

Send message destination:

```text
/app/chat/{joinCode}
```

---

## ⏳ Temporary Room Lifecycle

Every room is created with a 24-hour lifetime.

```text
Room Created
     │
     ▼
24-Hour Countdown
     │
     ▼
Room Active
     │
     ▼
Expiration Reached
     │
     ▼
Room Becomes Inactive
```

The backend calculates the room expiration time. The frontend only displays the countdown based on the server-provided expiration timestamp.

---

## 🕒 Timezone Handling

Fleeting displays chat timestamps using the **Asia/Kolkata (IST)** timezone.

This avoids differences between the server timezone, browser timezone, and the user's expected Indian local time.

---

## 🖥️ UI Highlights

The home page includes:

- Hero section
- Create Room
- Join Room
- Features
- How It Works
- About
- FAQ
- Contact
- Call-to-action section
- Footer with Fleeting branding

The room page includes:

- Room name
- Room code
- Expiration countdown
- QR code
- Copy Room Link
- Leave Room
- Real-time messages
- File sharing
- Download controls
- Copy message controls
- Multiline message composer
- Responsive mobile layout

---

## 🔒 Privacy Model

Fleeting is intentionally designed around temporary communication.

### No account system

The application does not require:

- Registration
- Login
- Email
- Phone number
- Password
- Social authentication

### Anonymous identity

A temporary guest name is generated in the browser and used only to identify messages within the room.

### Temporary content

The core design is based on short-lived rooms rather than permanent chat histories.

> **Fleeting is designed for temporary communication, not permanent storage.**

Do not use the application to share sensitive, confidential, or highly regulated information.

---

## ⚠️ Current Limitations

Fleeting is a small personal project and is not intended to compete with production-grade messaging platforms.

Current limitations include:

- No user authentication
- No permanent accounts
- No private one-to-one conversations
- No message reactions
- No read receipts
- No message editing/deletion
- No admin dashboard
- No permanent chat history
- No end-to-end encryption
- No advanced moderation system
- Free Render instances may spin down after inactivity

---

## 🧪 Testing Checklist

Before making a production release, test:

### Rooms

- [ ] Create a room
- [ ] Generate unique room code
- [ ] Join using room code
- [ ] Join using room URL
- [ ] Scan QR code
- [ ] Verify 24-hour countdown
- [ ] Verify expired room cannot be accessed

### Chat

- [ ] Send messages
- [ ] Receive messages in another browser
- [ ] Refresh and verify message history
- [ ] Test multiline messages
- [ ] Test pasted code
- [ ] Test `Enter`
- [ ] Test `Shift + Enter`
- [ ] Test copy message

### Files

- [ ] Upload PDF
- [ ] Upload JS/HTML/TXT
- [ ] Upload image
- [ ] Verify file size
- [ ] Download uploaded file
- [ ] Verify original filename
- [ ] Test file sharing from another browser

### Production

- [ ] Verify Render deployment
- [ ] Verify HTTPS
- [ ] Verify WebSocket connection
- [ ] Verify QR code points to production URL
- [ ] Verify Supabase Storage
- [ ] Verify database connectivity

---

## 📌 Version History

| Version | Description |
|---|---|
| `v1.0.0` | Initial release |
| `v1.1.0` | Stable production release with redesigned UI, messaging improvements, file sharing improvements, timezone fixes, 24-hour room handling, and Render deployment |

---

## 🗺️ Future Improvements

Potential future improvements:

- Active-user presence
- Better connection status indicator
- Drag-and-drop file uploads
- Image previews
- Message search
- Better error handling
- Rate limiting
- Stronger file-type validation
- Automated cleanup monitoring
- End-to-end encryption
- Optional room passwords
- Optional room ownership
- More deployment options

---

## 🤝 Contributing

Contributions and suggestions are welcome.

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature

# Commit your changes
git add .
git commit -m "Add your feature"

# Push the branch
git push origin feature/your-feature
```

Then open a Pull Request.

---

## 📄 License

No open-source license has been specified for the repository yet.

If you plan to make Fleeting publicly reusable, consider adding an appropriate license such as MIT.

---

## 👨‍💻 Author

**Lakshay Bamel**

MCA Student | Software Development | AI/ML | Cloud

- GitHub: https://github.com/lakshaybamel
- Project: https://github.com/lakshaybamel/temporary-chat
- Live Demo: https://fleeting-yo6v.onrender.com

---

<div align="center">

### Fleeting

**Chat. Share. Gone.**

Built with Java, Spring Boot, WebSocket, PostgreSQL, Supabase, and Docker.

</div>
