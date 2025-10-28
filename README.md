<div align="center">

<h3>🚀 Connect with Expert Mentors. Accelerate Your Growth.</h3>

<p align="center">
  <strong>A modern, AI-powered mentorship platform connecting students with industry experts</strong>
</p>

<!-- Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

<!-- Quick Links -->
<p align="center">
  <a href="https://lovable.dev/projects/a38ee718-2896-40dd-b995-43875d096ec9"><strong>🌐 Live Demo</strong></a> •
  <a href="./docs/API_DOCUMENTATION.md"><strong>📚 API Docs</strong></a> •
  <a href="./PHASE2_SUMMARY.md"><strong>✨ Phase 2 Features</strong></a> •
  <a href="#-getting-started"><strong>🚀 Quick Start</strong></a>
</p>

</div>

---

## 📋 Table of Contents

- [✨ Project Overview](#-project-overview)
- [🎯 Key Features](#-key-features)
- [🆕 Phase 2 Features](#-phase-2-features-new)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [💻 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [📚 API Documentation](#-api-documentation)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📧 Contact](#-contact)

---

## ✨ Project Overview

**MatePeak** is a comprehensive mentorship platform that bridges the gap between students seeking guidance and experienced professionals willing to share their expertise. Built with modern technologies and focused on user experience, MatePeak provides a seamless environment for mentorship connections.

### 🎯 Mission
*"Democratizing access to expert guidance and accelerating professional growth through meaningful mentorship"*

### Why MatePeak?

- 🔍 **AI-Powered Discovery** - Smart mentor matching using OpenAI embeddings
- 📅 **Seamless Scheduling** - Integrated calendar with real-time availability
- 💰 **Transparent Economics** - 90/10 revenue split (90% to mentors)
- 🎥 **Built-in Video** - Native video call infrastructure
- 📊 **Comprehensive Analytics** - Track sessions, earnings, and progress
- ⭐ **Quality Assurance** - Verified profiles and review system
- 🔒 **Secure & Private** - Row-level security and encrypted communications

---

## 🎯 Key Features

### For Students 🎓

- 🔎 **Advanced Search** - 15+ filters, AI-powered discovery
- 📅 **Easy Booking** - Real-time availability, instant confirmation
- 💳 **Secure Payments** - Multiple session durations (30/60/90 min)
- 📊 **Personal Dashboard** - Track sessions, payments, and reviews
- ⭐ **Review System** - Post-session feedback and ratings

### For Mentors 👨‍🏫

#### Core Features
- 👤 **Profile Management** - Comprehensive bio, experience, pricing
- 📆 **Availability Calendar** - Recurring slots, specific dates, block dates
- 💰 **Wallet System** - Automated earnings, withdrawal requests (90% share)
- 📊 **Session Management** - Approve, reject, reschedule sessions

#### Phase 2 Features (NEW!) 🆕
- 📅 **Advanced Calendar** - Visual monthly calendar with recurring patterns
- 🗓️ **Session Calendar View** - Color-coded sessions, export to ICS
- 💬 **Real-time Messaging** - Session-based chat with templates
- 👥 **Student Directory** - CRM with private notes, statistics
- ⭐ **Reviews Management** - Reply to reviews, filter by rating, export CSV
- 📈 **Analytics Dashboard** - Performance metrics and insights

### For Administrators 👑

- 📊 **Platform Metrics** - Real-time dashboard, growth analytics
- 👥 **User Management** - Verification, approval, moderation
- 💵 **Revenue Tracking** - Commission monitoring, financial reports

---

## 🆕 Phase 2 Features (NEW!)

<div align="center">

### 🎉 6 Major Features Just Released!

</div>

### 1. ⭐ Reviews & Ratings Management
- View all reviews in centralized dashboard
- Reply to reviews with mentor responses
- Filter by rating (1-5 stars)
- Export reviews to CSV
- Visual rating distribution

### 2. 📅 Advanced Availability Calendar
- Visual monthly calendar interface
- **Recurring weekly patterns** ("Every Monday 9-10am")
- **Specific date slots** (one-time availability)
- **Block dates** for vacations
- Color-coded indicators (green/red)

### 3. 🗓️ Session Calendar View
- Monthly calendar grid with all sessions
- **Color-coded status** (pending/confirmed/completed/cancelled)
- **Export to ICS** for Google Calendar
- Click session for details modal
- Session statistics cards

### 4. 💬 Session-Based Messaging
- **Real-time chat** via Supabase subscriptions
- **Two-panel layout** (conversations + chat)
- **Message templates** (confirmation, reminder, follow-up)
- **Unread badges** with counts
- Search conversations

### 5. 👥 Student Directory
- Groups all bookings by student
- **Aggregated statistics** per student
- **Private notes system** (mentor-only)
- Search by name or email
- Engagement tracking

### 6. ✨ Earnings Placeholder
- Beautiful "Coming Soon" card
- Gradient background with animation
- Placeholder for Razorpay integration

📖 **Full Documentation**: [PHASE2_SUMMARY.md](./PHASE2_SUMMARY.md)

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router v6** - Routing
- **TanStack Query** - Data fetching

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - JWT authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions (Deno)
- **OpenAI API** - AI search
- **pgvector** - Vector similarity

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ - [Download](https://nodejs.org/)
- **npm** v9+ - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/iteshprajapati/MatePeak.git
cd MatePeak

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# 4. Run database migrations (IMPORTANT for Phase 2!)
# Open Supabase Dashboard → SQL Editor
# Copy and run: supabase/migrations/20251028_phase2_complete_migration.sql

# 5. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 💻 Usage

### User Roles

- **🎓 Student** - Search mentors, book sessions, leave reviews
- **👨‍🏫 Mentor** - Manage profile, availability, sessions, students
- **👑 Admin** - Platform management, metrics, verification

### Quick API Examples

```typescript
// Authentication
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });

// Search mentors
const { data } = await supabase
  .from('expert_profiles')
  .select('*')
  .eq('is_approved', true);

// Book session
await supabase.functions.invoke('book-session', {
  body: { expert_id, session_date, duration }
});

// Real-time messaging (Phase 2)
supabase
  .channel('session_messages')
  .on('postgres_changes', { event: 'INSERT' }, handleNewMessage)
  .subscribe();
```

---

## 📁 Project Structure

```
MatePeak/
├── public/               # Static assets
│   └── matepeak-logo.svg # Brand logo
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── dashboard/   # Dashboard features
│   │   └── onboarding/  # Mentor onboarding
│   ├── pages/           # Route pages
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── integrations/    # Supabase integration
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── docs/                # Documentation
└── package.json         # Dependencies
```

---

## 📚 API Documentation

For complete API documentation:
👉 **[View Full API Docs](./docs/API_DOCUMENTATION.md)**

---

## 🗺️ Roadmap

### ✅ Completed

- [x] Phase 1: Core MVP (authentication, search, booking, reviews)
- [x] Phase 2: Advanced features (calendar, messaging, CRM)

### 🚧 In Progress

- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Video calling integration
- [ ] Email notifications
- [ ] SMS reminders

### 🔮 Planned

- [ ] Mobile apps (iOS/Android)
- [ ] Group mentoring
- [ ] Mentorship programs
- [ ] AI-powered matching
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add: Amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Contribution Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Itesh Prajapati** - [@iteshprajapati](https://github.com/iteshprajapati)

**Project Links**:
- 📂 [Repository](https://github.com/iteshprajapati/MatePeak)
- 🌐 [Live Demo](https://lovable.dev/projects/a38ee718-2896-40dd-b995-43875d096ec9)
- 🐛 [Report Bug](https://github.com/iteshprajapati/MatePeak/issues)
- 💡 [Request Feature](https://github.com/iteshprajapati/MatePeak/issues)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Lovable Platform](https://lovable.dev/)

---

## 📊 Project Stats

- **Total Code**: ~15,000 lines
- **Components**: 80+
- **Database Tables**: 15+
- **Technologies**: 20+
- **Development Time**: 300+ hours

---

<div align="center">

**Built with ❤️ by [Itesh Prajapati](https://github.com/iteshprajapati)**

**If you found this helpful, please give it a ⭐!**

[⬆ Back to Top](#matepeak)

</div>
