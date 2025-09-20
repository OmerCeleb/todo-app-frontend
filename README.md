# Todo Frontend Application

A modern, feature-rich React Todo application with advanced productivity features, drag-and-drop functionality, and seamless backend integration. Built with TypeScript, Tailwind CSS, and modern React patterns.

## 🚀 Features

### Core Functionality
- **Complete CRUD Operations**: Create, read, update, and delete todos
- **Drag & Drop Reordering**: Intuitive task reordering with `@dnd-kit`
- **Advanced Filtering**: Filter by status, priority, category, and date ranges
- **Smart Search**: Search across titles and descriptions
- **Bulk Operations**: Select and manage multiple todos at once
- **Real-time Statistics**: Dashboard with completion analytics

### User Experience
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Toast Notifications**: Real-time feedback for user actions
- **Sound Effects**: Optional audio feedback for interactions
- **Offline Support**: Works offline with automatic sync when reconnected
- **Data Import/Export**: JSON, TXT, and PDF import capabilities

### Productivity Features
- **Priority Management**: Low, Medium, High priority levels with visual indicators
- **Category Organization**: Custom categories with color coding
- **Due Date Tracking**: Calendar integration with overdue detection
- **Todo Templates**: Pre-built templates for common workflows
- **Advanced Filters**: Date ranges, priority levels, and completion status
- **Sorting Options**: Multiple sorting criteria with ascending/descending order

### Developer Experience
- **TypeScript**: Full type safety throughout the application
- **Modern React Patterns**: Hooks, Context API, and custom hooks
- **Component Architecture**: Modular, reusable components
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: Comprehensive loading and error state management

## 🛠 Technology Stack

- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Modern drag and drop library
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and development server
- **React Hooks** - State management and side effects

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── TodoForm/               # Todo creation and editing
│   ├── TodoItem/               # Individual todo display
│   ├── TodoFilters/            # Filtering and search
│   ├── Dashboard/              # Analytics and statistics
│   ├── Settings/               # Application settings
│   ├── BulkActions/            # Multi-todo operations
│   ├── DragDropContext/        # Drag and drop functionality
│   └── Notification/           # Toast notifications
├── hooks/
│   ├── useTodos.ts            # Todo state management
│   ├── useTodosAPI.ts         # API integration
│   ├── useTheme.ts            # Theme management
│   ├── useOfflineSync.ts      # Offline functionality
│   └── useDebounce.ts         # Performance optimization
├── utils/
│   ├── todoTemplates.ts       # Predefined todo templates
│   ├── categoryColors.ts      # Category color management
│   ├── dateUtils.ts           # Date manipulation utilities
│   └── validation.ts          # Input validation
├── config/
│   └── env.ts                 # Environment configuration
├── types/
│   └── index.ts               # TypeScript type definitions
└── App.tsx                    # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Todo Backend API running on `http://localhost:8080`

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/todo-frontend.git
cd todo-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_API_TIMEOUT=10000

# App Configuration
REACT_APP_NAME=Todo App
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_ANIMATIONS=true
REACT_APP_ENABLE_TOAST_NOTIFICATIONS=true
REACT_APP_DEBUG_MODE=false
```

4. **Start the development server**
```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:3000`

## 🔧 Configuration

### Backend Integration

The application is configured to connect to the Spring Boot backend:

```typescript
// src/config/env.ts
export const env = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    API_TIMEOUT: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
    // ... other configuration
}
```

### Theme Configuration

The app supports multiple themes with automatic system detection:

```typescript
// Automatic theme detection
const [theme, setTheme] = useTheme(); // 'light' | 'dark' | 'system'
```

## 🎯 Key Components

### TodoForm
Handles todo creation and editing with comprehensive validation:
- Required field validation
- Character limits
- Date validation
- Category suggestions

### TodoFilters
Advanced filtering system with:
- Status filters (all, active, completed)
- Priority filters (low, medium, high)
- Date range filters (today, this week, overdue)
- Category filtering
- Search functionality

### Dashboard
Analytics and statistics display:
- Completion percentage
- Priority distribution
- Category breakdown
- Productivity trends

### DragDropContext
Drag and drop functionality using `@dnd-kit`:
- Accessible drag and drop
- Touch support
- Smooth animations
- Auto-scrolling

## 🎨 Styling

### Tailwind CSS
The application uses Tailwind CSS for styling with:
- Custom color palette
- Dark mode support
- Responsive breakpoints
- Component-specific styles

### Dark Mode
Automatic dark mode detection with manual override:
```typescript
// Theme switching
const { theme, setTheme } = useTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔄 State Management

### Custom Hooks
State management through custom hooks:

```typescript
// Todo management
const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    filters,
    setFilters
} = useTodosAPI();

// Theme management
const { theme, setTheme } = useTheme();

// Offline sync
const { isOnline, syncStatus } = useOfflineSync();
```

## 📊 Data Flow

```
User Interaction
       ↓
   Component
       ↓
   Custom Hook
       ↓
   API Service
       ↓
   Backend API
       ↓
   PostgreSQL
```

## 🔌 API Integration

### Endpoints Used
- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle` - Toggle completion
- `GET /api/todos/stats` - Get statistics

### Error Handling
Comprehensive error handling with user-friendly messages:
- Network errors
- Validation errors
- Server errors
- Offline scenarios

## 🎨 Features in Detail

### Todo Templates
Pre-built templates for common workflows:
- Project planning
- Meeting preparation
- Daily routines
- Custom template creation

### Import/Export
Multiple format support:
- **JSON**: Full todo data with metadata
- **TXT**: Simple text lists with auto-parsing
- **CSV**: Spreadsheet-compatible format

### Bulk Operations
Efficient multi-todo management:
- Select all/none
- Bulk delete
- Bulk priority changes
- Bulk category assignment

### Advanced Filtering
Sophisticated filtering system:
- Multiple criteria combination
- Saved filter presets
- Date range selections
- Custom category filters

## 🚀 Performance Optimizations

- **Debounced Search**: Optimized search with 300ms debounce
- **Virtual Scrolling**: Efficient rendering for large todo lists
- **Lazy Loading**: Component-based code splitting
- **Memoization**: React.memo and useMemo optimizations
- **Bundle Optimization**: Tree shaking and code splitting

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 🏗 Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

## 🔄 Deployment

### Environment Variables for Production
```env
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ANIMATIONS=true
REACT_APP_DEBUG_MODE=false
```

### Build Optimization
- Minified JavaScript and CSS
- Optimized images and assets
- Gzip compression
- CDN-ready static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [@dnd-kit](https://dndkit.com/) - Drag and drop
- [Lucide](https://lucide.dev/) - Icon library
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: your.email@example.com

---

**Built with ❤️ using React and TypeScript**