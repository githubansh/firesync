# 🔥 FireSync: Cross-Platform Synchronized Watch Parties

> *Real-time synchronized entertainment experiences across FireTV and Mobile devices*

![React](https://img.shields.io/badge/-React-%2361DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-%23007ACC?logo=typescript&logoColor=white) ![Supabase](https://img.shields.io/badge/-Supabase-%233ECF8E?logo=supabase&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-%2338B2AC?logo=tailwind-css&logoColor=white)

## 🚀 Live Demo

🌐 **[FireSync App](https://firesync.vercel.app/)**  
🌐 **[Mobile interface](https://mainsocialwatch.vercel.app/)**

**One link, two experiences** - Intelligent device detection serves optimized interfaces:
- **FireTV/Large Screen**: Host interface with room management  
- **Mobile Device**: Remote control + social features

---

## 🎯 Project Overview

FireSync is a **unified web application** that creates seamless watch party experiences across multiple platforms. A single deployable app intelligently serves different interfaces based on device type, enabling cross-device synchronization and control.

### The Problem
Traditional streaming platforms lack synchronized viewing capabilities, making remote group entertainment difficult with no real-time interaction or cross-device control.

### Our Solution
![WhatsApp Image 2025-06-22 at 21 46 45](https://github.com/user-attachments/assets/e61304cf-68b3-4276-8ca0-62c3f927cde6)

A comprehensive platform with dual interfaces that work together:
- **🔥 FireTV Interface**: Large screen experience for hosting content
- **📱 Mobile Interface**: Universal remote control + social features

---

## ✨ Key Features
![WhatsApp Image 2025-06-22 at 21 53 25](https://github.com/user-attachments/assets/01cdf3aa-121e-43d4-b737-13fdc612d2c4)

### 🎮 **Cross-Device Remote Control**
- Full FireTV remote functionality from mobile devices
- Perfect synchronization across all connected devices (<100ms latency)
- Multi-user control with conflict resolution
- Real-time playback status updates

### 💬 **Enhanced Social Experience**

- **Real-time Party Chat**: Live messaging with emoji support
- **Voice Messages**: WebRTC-powered voice note recording
- **Participant Management**: Live connection status and presence indicators
- **Anonymous Joining**: Quick access without registration barriers

### 🔄 **Advanced Synchronization**
- **Real-time Sync**: Supabase WebSocket-based instant updates
- **Smart Room Management**: Secure 6-digit room codes
- **Connection Recovery**: Automatic reconnection on network issues
- **Cross-Platform Compatibility**: Works seamlessly across all devices

---

## 🛠 Tech Stack

| **Frontend** | **Backend** | **Real-time** | **Infrastructure** |
|--------------|-------------|---------------|-------------------|
| React 18+ | Supabase | WebSocket API | Vercel (Deployment) |
| TypeScript | PostgreSQL | WebRTC | Deno (Edge Functions) |
| Tailwind CSS | Row Level Security | Real-time Subscriptions | GitHub Actions (CI/CD) |
| shadcn/ui | Edge Functions | Custom Sync Engine | Progressive Web App |

---

## 🔍 How It Works

### User Flow

1. **Open Application**: User accesses the deployed link on any device
2. **Device Detection**: App automatically detects device type and serves appropriate interface
3. **Create/Join Room**: 
   - **Host**: Creates room and gets unique 6-digit code
   - **Participant**: Enters room code to join
4. **Connect & Sync**: All devices automatically connect and establish real-time synchronization
5. **Control & Chat**: Users can control playback and chat in real-time across all devices
6. **Share Experience**: Synchronized viewing with instant social interaction

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Modern browser with WebSocket support

### Setup
```bash
# Clone and install
git clone https://github.com/yourusername/firesync.git
cd firesync
npm install

# Environment setup
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🎭 User Experience

### FireTV Interface
- **Large Screen Optimized**: Perfect for TV viewing
- **Room Hosting**: Create and manage watch parties
- **Visual Room Codes**: Easy-to-share 6-digit codes
- **Live Participant Display**: Real-time connection status

### Mobile Interface  
- **Universal Remote**: Full navigation and playback controls
- **Room Management**: Create or join parties instantly
- **Live Chat**: Real-time messaging with voice notes
- **Direct Sharing**: Native mobile sharing integration

---

## 📂 Project Structure

```
src/
├── components/
│   ├── firetv/          # FireTV-specific components
│   ├── mobile/          # Mobile-optimized components
│   └── ui/              # Shared UI components
├── hooks/               # Custom React hooks
│   ├── useRealtimeSync.ts
│   └── useRoomManagement.ts
├── integrations/        # External services
│   └── supabase/        # Supabase client & utilities
└── pages/               # Route components

supabase/
├── functions/           # Edge functions (Deno)
├── migrations/          # Database schema
└── policies.sql         # Security policies
```

---

## 🏆 Technical Achievements

### Performance Metrics
- **⚡ Sync Latency**: <100ms average response time
- **📱 UI Responsiveness**: 60fps smooth animations  
- **🔄 Connection Time**: <500ms room joining
- **💬 Message Delivery**: <50ms chat latency
- **📦 Bundle Size**: <2MB optimized build

### Security & Scalability
- **🔐 Row Level Security**: Database-level access control
- **🔒 Encrypted Communication**: All data encrypted in transit
- **⚡ Edge Functions**: Serverless scalability with Deno
- **🌐 Global CDN**: Vercel edge deployment
- **🔄 Auto-Recovery**: Automatic reconnection handling

---

## 💡 Innovation Highlights

### 🎯 **Dual Interface Architecture**
Single codebase serving optimized experiences for different devices - revolutionary approach to cross-platform development.

### 📱 **Mobile-as-Remote Concept**
Transforming mobile devices into universal remote controls for large screens with perfect synchronization.

### 🔄 **Real-time Synchronization Engine**
Custom-built sync system maintaining <100ms latency across multiple devices and platforms.

### 🎵 **Social Integration**
WebRTC-powered voice messaging and real-time chat creating immersive shared experiences.

---

## 🌱 Future Roadmap

- Fire TV remote app integration
- AI recommendation integration
- Single app for all FireTV connectivities
- Audio synchronization improvements
- Custom themes and room personalization


## 👥 Team

**Ansh Gadwal**  
**Chirag Paliwal**

---

## 📊 Database Schema

```sql
-- Core tables for room management and synchronization
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE participants (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sync_states (
  room_id UUID PRIMARY KEY REFERENCES rooms(id),
  current_time DECIMAL DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

---

---

*Building the future of social entertainment, one synchronized moment at a time* 🎬✨

