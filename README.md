# 🎨 CatStock - Sistem Manajemen Inventori Toko Cat

<div align="center">

![CatStock Logo](https://img.shields.io/badge/CatStock-Inventory%20Management-blue?style=for-the-badge&logo=react)

**Sistem manajemen inventori toko cat yang dioptimalkan untuk iPad Pro 11"**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Demo](#demo) • [📖 Tutorial](#tutorial) • [⚡ Quick Start](#quick-start) • [🛠️ Installation](#installation)

</div>

---

## 🎯 Tentang CatStock

CatStock adalah aplikasi web modern untuk mengelola inventori toko cat yang dirancang khusus untuk iPad Pro 11". Aplikasi ini menyediakan solusi lengkap untuk:

- 📦 **Manajemen Produk** - Kelola katalog produk cat dengan mudah
- 🚚 **Data Pemasok** - Atur informasi supplier dan kontak
- ⬆️⬇️ **Transaksi Stok** - Catat stok masuk, keluar, dan penyesuaian
- 📊 **Laporan Bisnis** - Analisis penjualan dan performa inventori
- 💰 **Mata Uang Rupiah** - Format harga dalam Rupiah Indonesia
- 🇮🇩 **Bahasa Indonesia** - Interface lengkap dalam bahasa Indonesia

## ✨ Fitur Utama

### 🏠 Dashboard Komprehensif
- Ringkasan bisnis real-time
- Alert stok minimum
- Aktivitas transaksi terbaru
- Statistik penjualan

### 📱 Optimasi iPad Pro 11"
- Touch-friendly interface
- Responsive design (portrait/landscape)
- Gesture navigation
- Keyboard shortcuts

### 🔐 Keamanan & Authentication
- JWT-based authentication
- Session management
- CSRF protection
- Secure middleware

### 📊 Laporan & Analytics
- Laporan stok real-time
- Analisis penjualan
- Export data ke CSV
- Grafik performa

## 🚀 Demo

### Akun Demo
```
Email: owner@catstock.com
Password: admin123
```

### Screenshot
*Coming soon - Screenshots akan ditambahkan*

## 📖 Tutorial

CatStock dilengkapi dengan tutorial interaktif yang komprehensif:

- **📚 Tutorial Lengkap** - Panduan step-by-step di `/tutorial`
- **⚡ Panduan Cepat** - Quick start guide di `/panduan-cepat`
- **🧪 Test Pages** - Halaman test untuk debugging di `/test-indonesia`

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/DaffaHM/catstock.git
cd catstock
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Setup database
npx prisma db push

# Seed initial data
npm run seed
```

### 4. Setup Environment
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local dengan konfigurasi Anda
```

### 5. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dan login dengan akun demo.

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### Detailed Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/DaffaHM/catstock.git
   cd catstock
   npm install
   ```

2. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-change-in-production"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework dengan App Router
- **React 18** - UI library dengan hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - Database ORM
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens

### Development
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Struktur Proyek

```
catstock/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── products/          # Product management
│   ├── suppliers/         # Supplier management
│   ├── transactions/      # Transaction pages
│   ├── reports/           # Reports & analytics
│   └── tutorial/          # Interactive tutorial
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/           # Layout components
│   ├── products/         # Product components
│   ├── transactions/     # Transaction components
│   └── ui/               # UI components
├── lib/                  # Utilities & configurations
│   ├── actions/          # Server actions
│   ├── queries/          # Database queries
│   ├── utils/            # Utility functions
│   └── validations/      # Form validations
├── prisma/               # Database schema & migrations
└── __tests__/            # Test files
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

- **[Tutorial Penggunaan](TUTORIAL_PENGGUNAAN.md)** - Panduan lengkap pengguna
- **[Development Setup](DEVELOPMENT_SETUP.md)** - Setup untuk developer
- **[API Documentation](docs/api.md)** - API reference
- **[Component Guide](docs/components.md)** - Component documentation

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**DaffaHM**
- GitHub: [@DaffaHM](https://github.com/DaffaHM)
- Repository: [catstock](https://github.com/DaffaHM/catstock)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">

**⭐ Jika project ini membantu, berikan star di GitHub! ⭐**

Made with ❤️ for Indonesian paint store owners

</div>