# 📝 Modern Todo Application - Frontend

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A modern, responsive todo management application built with React, TypeScript, and Tailwind CSS.

[🌐 Live Demo](#) | [📚 Backend Repository](https://github.com/OmerCeleb/todo-backend) | [🐛 Report Bug](https://github.com/OmerCeleb/todo-app-frontend/issues)

---

## ✨ Features

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface with smooth animations
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Accessible**: WCAG AA compliant with keyboard navigation support

### ✅ Todo Management
- **CRUD Operations**: Create, read, update, and delete todos
- **Priority Levels**: LOW, MEDIUM, HIGH priority management
- **Categories**: Organize todos by custom categories
- **Due Dates**: Track deadlines with overdue detection
- **Bulk Actions**: Select and manage multiple todos at once
- **Drag & Drop**: Reorder todos (coming soon)

### 🔐 Authentication
- **JWT Authentication**: Secure login and registration
- **Session Management**: Automatic token refresh
- **Protected Routes**: Route guards for authenticated pages

### 📊 Analytics & Statistics
- **Dashboard**: Real-time statistics and insights
- **Progress Tracking**: Visual completion progress
- **Category Analytics**: Performance by category
- **Overdue Tracking**: Monitor overdue tasks

### 🚀 Performance
- **Code Splitting**: Lazy loading for optimal performance
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: Efficient rendering of large lists
- **Debounced Search**: Optimized search functionality
- **Offline Support**: PWA capabilities (coming soon)

---

## 🏗️ Tech Stack

### Core
- **React 18.3** - Modern React with concurrent features
- **TypeScript 5.5** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework

### State Management & Routing
- **React Context API** - Lightweight state management
- **Custom Hooks** - Reusable logic encapsulation

### UI Components
- **Lucide React** - Beautiful icon library
- **Custom Components** - Fully accessible component library
- **Headless UI** (planned) - Unstyled, accessible components

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **React Testing Library** - Component testing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **npm 9+** or **yarn 1.22+**
- **Backend API** running (see [backend repo](https://github.com/OmerCeleb/todo-backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/OmerCeleb/todo-app-frontend.git
cd todo-app-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL
# VITE_API_BASE_URL=http://localhost:8080

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── TodoForm/       # Todo form components
│   ├── TodoListView/   # Todo list components
│   ├── ui/             # Reusable UI components
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
│   ├── useTodos.ts
│   ├── useTodosAPI.ts
│   ├── useTheme.ts
│   ├── useDebounce.ts
│   ├── usePerformance.ts
│   └── ...
├── services/           # API services
│   ├── api.ts
│   ├── todoService.ts
│   └── authService.ts
├── utils/              # Utility functions
│   ├── dateUtils.ts
│   ├── todoTemplates.ts
│   ├── categoryColors.ts
│   ├── accessibility.ts
│   └── ...
├── types/              # TypeScript type definitions
├── config/             # Configuration files
│   └── env.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage

# Run specific test file
npm test TodoForm.test.tsx
```

### Testing Coverage
- **Unit Tests**: Individual functions and utilities
- **Component Tests**: React component rendering and interactions
- **Integration Tests**: Component interactions and data flow
- **Accessibility Tests**: ARIA labels and keyboard navigation

---

## 🎨 Customization

### Theme Configuration

Edit `src/config/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    // ... customize colors
  }
};
```

### Environment Variables

Create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000
VITE_ENABLE_ANALYTICS=false
```

---

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build -- --analyze
```

### Deployment Options

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: `npm run deploy`
- **Docker**: `docker build -t todo-app .`

---

## 🔧 Configuration

### Vite Configuration

`vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### TypeScript Configuration

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true
  }
}
```

---

## 🌟 Key Features Deep Dive

### Performance Optimizations

1. **React.memo**: Prevents unnecessary re-renders
2. **useMemo**: Memoizes expensive computations
3. **useCallback**: Memoizes callback functions
4. **Code Splitting**: Dynamic imports for routes
5. **Debouncing**: Optimized search and input handling

### Accessibility Features

1. **Keyboard Navigation**: Full keyboard support
2. **ARIA Labels**: Proper semantic HTML and ARIA attributes
3. **Focus Management**: Focus traps in modals
4. **Screen Reader Support**: Announcements for dynamic content
5. **Color Contrast**: WCAG AA compliant colors

### Error Handling

1. **Error Boundaries**: Catch React errors gracefully
2. **API Error Handling**: User-friendly error messages
3. **Network Error Detection**: Offline mode support
4. **Form Validation**: Client-side validation with clear feedback

---

## 🛠️ Development

### Code Style

We use ESLint and Prettier for consistent code style:

```bash
# Lint code
npm run lint

# Format code
npm run format

# Fix auto-fixable issues
npm run lint:fix
```

### Component Development

```typescript
// Example: Creating a new component
import { memo } from 'react';

export const MyComponent = memo(({ prop }: Props) => {
  return <div>{prop}</div>;
});
```

---

## 📈 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: 95+
- **Bundle Size**: < 200KB (gzipped)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Keep components small and focused

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ömer Çelebi**

- LinkedIn: [@omercelebii](https://www.linkedin.com/in/omercelebii/)
- Email: omer534@outlook.com
- GitHub: [@OmerCeleb](https://github.com/OmerCeleb)

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Tailwind Labs for Tailwind CSS
- Lucide for beautiful icons
- Open source community for inspiration

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

<div align="center">

**⭐ If you found this project helpful, please give it a star!**

[View Demo](#) · [Report Bug](https://github.com/OmerCeleb/todo-app-frontend/issues) · [Request Feature](https://github.com/OmerCeleb/todo-app-frontend/issues)

Made with ❤️ and ☕ by Ömer Çelebi

</div>