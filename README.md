# Society Maintenance Tracker

A complete multi-tenant SaaS platform for society maintenance complaint management.

## Features

### Input Features
- ✅ **Resident Complaints**: Submit complaints with title, description, category, location, and up to 5 photos
- ✅ **Admin Status Updates**: Update complaint status with automatic history tracking
- ✅ **Admin Priority Updates**: Adjust complaint priority levels with audit trail
- ✅ **Admin Notices**: Create announcements with priority levels and optional expiry dates

### Output Features  
- ✅ **Tracked Complaints**: All complaints with complete history tracking
- ✅ **Notice Board**: View and manage society notices with priority indicators
- ✅ **Email Updates**: Automated email notifications for status changes, priority updates, and new notices

### Visibility & Access
- ✅ **All residents can view all complaints** - not just their own
- ✅ **Complaint history accessible to all users** with full audit trail
- ✅ **Admin filtering by description and photos** - search in title AND description
- ✅ **Admin filtering by category** - organize and find issues by type

## Tech Stack

- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Authentication**: JWT-based with role-based access
- **Email**: Nodemailer with HTML templates
- **File Upload**: Multer for complaint photos

## Quick Start

### Backend Setup
```bash
cd /mnt/c/Users/praja/OneDrive/Desktop/Agentic/society-maintenance-tracker/backend
npm install
node server.js
```

### Frontend Setup
```bash
cd /mnt/c/Users/praja/OneDrive/Desktop/Agentic/society-maintenance-tracker/frontend
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Demo Credentials

- **Resident**: resident@demo.com / password
- **Admin**: admin@demo.com / password

## Email Configuration (Optional)

To enable email notifications, add these to `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@societytracker.com
FRONTEND_URL=http://localhost:5173
```

## Database Schema

### Core Tables
- **users**: Residents and administrators
- **complaints**: Main complaint records with status, priority, photos
- **complaint_history**: Complete audit trail of all changes
- **categories**: Maintenance issue categories with color coding
- **notices**: Society announcements and notices
- **email_notifications**: Tracking of sent emails

### Key Features
- Foreign key relationships with cascading deletes
- Indexed columns for performance
- Timestamp tracking for all records
- JSON storage for photo URLs and arrays

## API Endpoints

### Public
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/seed` - Seed demo data

### Complaints
- `GET /api/complaints` - Get all complaints (residents see all)
- `GET /api/complaints/:id` - Get single complaint with history
- `POST /api/complaints` - Create new complaint (with photos)
- `POST /api/complaints/:id/comments` - Add comment

### Admin
- `GET /api/admin/complaints` - Get complaints with comprehensive filtering
- `PATCH /api/admin/complaints/:id/status` - Update status
- `PATCH /api/admin/complaints/:id/priority` - Update priority  
- `POST /api/admin/complaints/:id/notes` - Add admin notes
- `POST /api/admin/notices` - Create notice
- `GET /api/admin/dashboard` - Get dashboard statistics

### Notices
- `GET /api/notices` - Get all active notices
- `GET /api/notices/:id` - Get single notice

### Categories
- `GET /api/categories` - Get all categories

## Admin Filtering Options

- **Search**: Search in title AND description
- **Status**: pending, in_progress, resolved, closed
- **Priority**: low, medium, high, urgent
- **Category**: Filter by maintenance category
- **Photos**: Filter by presence/absence of photos
- **Sort**: by created_at, updated_at, priority, or status
- **Order**: ascending or descending

## Email Notifications

The system sends automated emails for:

- **New Complaint**: Notifies all admins when residents submit complaints
- **Status Updates**: Notifies residents when admin changes status
- **Priority Changes**: Notifies residents when priority is adjusted
- **New Notices**: Notifies all residents when admin creates notices

All emails include:
- Professional HTML templates
- Priority indicators with color coding
- Direct links to relevant pages
- Plain text fallback

## Frontend Pages

- **Login**: Secure authentication with role detection
- **Dashboard**: View all complaints with filtering and history
- **ComplaintForm**: Submit new complaints with photo upload
- **AdminDashboard**: Comprehensive admin interface with statistics and filtering
- **NoticeBoard**: View and create society notices

## Security Features

- Password hashing with bcrypt
- JWT authentication with expiration
- Role-based access control (admin/resident)
- File upload validation (images only, 5MB limit)
- SQL injection prevention with parameterized queries
- Input validation with express-validator

## Performance

- Better-sqlite3 for fast database operations
- Indexed database queries
- Efficient photo handling with local storage
- Optimized admin filtering with combined queries

## Project Structure

```
society-maintenance-tracker/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite setup and schema
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── complaints.js        # Complaint CRUD
│   │   ├── admin.js             # Admin operations
│   │   ├── notices.js           # Notice management
│   │   └── categories.js        # Category API
│   ├── utils/
│   │   └── emailService.js      # Email templates & sending
│   ├── uploads/                 # Uploaded complaint photos
│   ├── package.json
│   ├── server.js                # Express app
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client functions
│   │   ├── components/          # Reusable components
│   │   ├── context/             # React context providers
│   │   └── pages/               # Page components
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Development Notes

- Backend uses better-sqlite3 instead of sqlite3 for better compatibility
- Email service degrades gracefully if SMTP not configured
- Photo uploads are stored locally in backend/uploads/
- Complaint history is automatically tracked for all changes
- All residents can view all complaints as per requirements
- Admin dashboard provides comprehensive filtering capabilities

## Future Enhancements

- Push notifications for mobile support
- WhatsApp integration for notifications
- Multi-language support
- Advanced analytics and reporting
- SMS notifications for urgent issues
- Mobile app development