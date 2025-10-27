<div align="center">

# 🎓 MatePeak

### Connect with Expert Mentors. Accelerate Your Growth.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Live Demo](https://lovable.dev/projects/a38ee718-2896-40dd-b995-43875d096ec9) • [Documentation](./docs/API_DOCUMENTATION.md) • [Report Bug](https://github.com/iteshprajapati/MatePeak/issues) • [Request Feature](https://github.com/iteshprajapati/MatePeak/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About The Project

**MatePeak** is a modern mentorship platform that connects students and professionals with experienced mentors across various fields. Whether you're seeking career guidance, technical expertise, or personal development, MatePeak makes it easy to find, book, and connect with the right mentor for your goals.

### Why MatePeak?

- 🔍 **Smart Search**: AI-powered mentor discovery based on your specific needs
- 📅 **Easy Booking**: Seamless session scheduling with real-time availability
- 💰 **Transparent Pricing**: Clear pricing with secure payment processing
- 🎥 **Integrated Video**: Built-in video call infrastructure for remote sessions
- 📊 **Progress Tracking**: Dashboard to track your mentorship journey
- ⭐ **Quality Assurance**: Review and rating system ensures high-quality mentorship

---

## ✨ Key Features

### For Students
- 🔎 Advanced mentor search with filters (category, price, rating, experience)
- 📅 Real-time availability checking and instant booking
- 💳 Secure payment integration (90/10 revenue split)
- 🎥 Integrated video calling for remote sessions
- ⭐ Post-session review and feedback system
- 📊 Personal dashboard to track all sessions

### For Mentors
- 👤 Comprehensive profile management (bio, experience, pricing, availability)
- 📆 Calendar integration and availability management
- 💰 Automated wallet system with transaction tracking
- 💸 Easy withdrawal requests (90% revenue share)
- 📈 Performance analytics and earnings dashboard
- ⭐ Review management and reputation building

### For Administrators
- 📊 Real-time platform metrics and analytics
- 👥 User and mentor management
- 🏢 Institution verification system
- 💵 Revenue tracking and commission monitoring
- 📈 Growth metrics (daily/monthly/yearly trends)
- 🔧 Platform configuration and settings

---

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[React Router v6](https://reactrouter.com/)** - Client-side routing
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Reusable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Recharts](https://recharts.org/)** - Charting library for analytics

### Backend & Infrastructure
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - JWT authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions (Deno runtime)
  - Storage & CDN
- **[OpenAI API](https://openai.com/)** - AI-powered search
- **[pgvector](https://github.com/pgvector/pgvector)** - Vector similarity search

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

Check your installations:
```bash
node --version
npm --version
git --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iteshprajapati/MatePeak.git
   cd MatePeak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (or use the existing one):
   ```env
   VITE_SUPABASE_PROJECT_ID=hnevrdlcqhmsfubakljg
   VITE_SUPABASE_URL=https://hnevrdlcqhmsfubakljg.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ Yes |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | ✅ Yes |

> **Note:** Environment variables are already configured in the project. For production deployment, update these values in your hosting platform.

---

## 💻 Usage

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

### User Roles

The platform supports three user roles:

1. **Student** - Can search mentors, book sessions, and leave reviews
2. **Mentor** - Can create profiles, manage availability, and conduct sessions
3. **Admin** - Can manage platform, view metrics, and verify institutions

---

## 📁 Project Structure

```
MatePeak/
├── public/                      # Static assets
│   ├── robots.txt
│   └── lovable-uploads/        # Uploaded media files
│
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── home/              # Homepage sections
│   │   ├── onboarding/        # Onboarding flow
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MentorCard.tsx
│   │   └── ...
│   │
│   ├── pages/                 # Route pages
│   │   ├── Index.tsx          # Homepage
│   │   ├── MentorSearch.tsx   # Search & discovery
│   │   ├── MentorProfile.tsx  # Mentor details
│   │   ├── BookingPage.tsx    # Session booking
│   │   ├── Dashboard.tsx      # Student dashboard
│   │   ├── ExpertDashboard.tsx # Mentor dashboard
│   │   ├── ExpertOnboarding.tsx # Mentor setup
│   │   └── ...
│   │
│   ├── services/              # API services
│   │   ├── authService.ts     # Authentication
│   │   ├── mentorService.ts   # Mentor CRUD
│   │   ├── sessionService.ts  # Booking management
│   │   ├── reviewService.ts   # Reviews & ratings
│   │   └── expertProfileService.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-toast.ts
│   │   ├── use-mobile.tsx
│   │   ├── useAISearch.ts
│   │   └── useExpertOnboardingForm.ts
│   │
│   ├── integrations/          # Third-party integrations
│   │   └── supabase/
│   │       ├── client.ts      # Supabase client
│   │       └── types.ts       # Generated types
│   │
│   ├── lib/                   # Utilities
│   │   └── utils.ts           # Helper functions
│   │
│   ├── data/                  # Static data
│   │   └── mentors.ts         # Sample mentor data
│   │
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
│
├── supabase/                  # Supabase configuration
│   ├── functions/             # Edge functions
│   │   ├── book-session/      # Session booking logic
│   │   ├── manage-session/    # Session management
│   │   ├── ai-search/         # AI-powered search
│   │   ├── wallet-withdraw/   # Withdrawal processing
│   │   └── admin-metrics/     # Admin analytics
│   │
│   ├── migrations/            # Database migrations
│   └── config.toml            # Supabase config
│
├── docs/                      # Documentation
│   ├── API_DOCUMENTATION.md   # Complete API reference
│   ├── MVP_SETUP.md           # Setup guide
│   └── USAGE_EXAMPLES.md      # Code examples
│
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.ts         # Tailwind config
├── eslint.config.js           # ESLint config
└── README.md                  # This file
```

---

## 📚 API Documentation

For complete API documentation, including authentication, endpoints, request/response formats, and code examples, see:

👉 **[API Documentation](./docs/API_DOCUMENTATION.md)**

### Quick API Overview

```typescript
// Authentication
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })

// Search mentors
const { data } = await supabase.from('expert_profiles').select('*')

// Book a session
const { data } = await supabase.functions.invoke('book-session', {
  body: { mentor_id, session_time, duration }
})

// Submit review
await supabase.from('reviews').insert({ expert_id, rating, comment })
```

---

## 🗺️ Roadmap

### ✅ Completed (MVP)
- [x] User authentication & role management
- [x] Mentor profile creation & management
- [x] Advanced search with filters
- [x] Session booking system
- [x] Wallet & transaction tracking
- [x] Review & rating system
- [x] Admin dashboard with metrics
- [x] AI search infrastructure

### 🚧 In Progress
- [ ] Payment gateway integration (Stripe)
- [ ] Video call integration (Google Meet/Zoom)
- [ ] Real-time notifications
- [ ] Email notification system

### 🔮 Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Group mentoring sessions
- [ ] Mentorship programs & courses
- [ ] AI-powered mentor matching
- [ ] Calendar integrations (Google, Outlook)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Referral program
- [ ] Subscription plans
- [ ] Certification system

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 📧 Contact

**Itesh Prajapati** - [@iteshprajapati](https://github.com/iteshprajapati)

**Project Link**: [https://github.com/iteshprajapati/MatePeak](https://github.com/iteshprajapati/MatePeak)

**Live Demo**: [https://lovable.dev/projects/a38ee718-2896-40dd-b995-43875d096ec9](https://lovable.dev/projects/a38ee718-2896-40dd-b995-43875d096ec9)

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

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=iteshprajapati/MatePeak&type=Date)](https://star-history.com/#iteshprajapati/MatePeak&Date)

---

<div align="center">

**Made with ❤️ by [Itesh Prajapati](https://github.com/iteshprajapati)**

If you found this project helpful, please consider giving it a ⭐!

[⬆ Back to Top](#-matepeak)

</div>
