# SciCloud 🧬

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%5E22.18.0-brightgreen)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)

> **Open-source scientific laboratory management platform** for modern research teams

SciCloud is a **modular, self-hosted laboratory management platform** designed to adapt to any scientific domain and research workflow. Built with modern web technologies, it provides a flexible foundation with core modules that can be customized, disabled, or replaced with community-developed alternatives to perfectly match your laboratory's needs.

## ✨ Modular Architecture & Features

> **🧩 Fully Modular Design**: Every feature can be enabled, disabled, or replaced with community modules to create a solution perfectly tailored to your scientific domain.

### 🔧 **Core Platform Features**
*These foundational features ensure a secure, scalable, and user-friendly experience:*

- **👥 User & Role Management**: Manage users and roles with customizable permissions
- **🔔 Real-time Notifications**: Instant updates and configurable alert preferences
- **🌍 Internationalization support**: Multi-language support with locale-aware formatting

### 🔧 **Core Platform Features** **Included modules**

#### 🔬 **Laboratory Management Module**
- **Animal Tracking**: Complete animal management with health records and protocols
- **Equipment Management**: Instrument tracking with maintenance scheduling
- **Inventory Control**: Consumables management with stock level monitoring

#### 📊 **Project Management Module**
- **Research Projects**: Full project lifecycle management with status tracking
- **Team Collaboration**: Member management with role-based permissions
- **Document Storage**: Secure file management with version control
- **Progress Tracking**: Visual indicators and milestone management

### 🌟 **Community Module Ecosystem**
- **📦 Module Marketplace**: Browse and install community-developed modules
- **🔌 Plugin Architecture**: Simple integration of third-party extensions
- **🛠️ Custom Development**: Create your own modules using our development kit
- **🤝 Community Support**: Share modules with the global scientific community

## 🏗️ Technology Stack

### **Frontend**
- **Vue 3** with Composition API and TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for modern styling
- **ShadCN/UI** component library (Radix Vue)
- **Pinia** for state management
- **Vue Router** with lazy loading
- **Vue I18n** for internationalization

### **Backend**
- **Supabase** (PostgreSQL) with Row Level Security
- **Real-time subscriptions** for live updates
- **Edge Functions** for secure server-side operations
- **Supabase Storage** for file management

### **Development Tools**
- **TypeScript** throughout the application
- **ESLint** for code quality
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **pnpm** workspace for monorepo management

## 🚀 Quick Start

### Prerequisites

- **Node.js** (^22.18.0)
- **pnpm** (^10.15.0)
- **Docker** (for Supabase local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mburtin/SciCloud.git
   cd SciCloud
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development environment**
   ```bash
   pnpm dev
   ```

This command will:
- Start Supabase local instance
- Launch Edge Functions server
- Start the Vue development server

### 🌐 Access URLs

- **Web Application**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Supabase API**: http://localhost:54321

## 🤝 Contributing

We welcome contributions from the scientific community!

## 👨‍💻 Main contributors

**Michael BURTIN** - *Project Creator*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vue.js Team** - For the amazing reactive framework
- **Supabase** - For the powerful backend-as-a-service platform
- **Scientific Community** - For inspiration and requirements gathering
- **Open Source Contributors** - For making this project possible

---

<div align="center">

**🧬 Built with IA & ❤️ for the scientific community**

[Documentation](./docs/) • [Issues](https://github.com/mburtin/SciCloud/issues) • [Discussions](https://github.com/mburtin/SciCloud/discussions)

</div>
