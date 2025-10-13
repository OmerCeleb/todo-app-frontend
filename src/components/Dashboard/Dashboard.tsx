// src/components/Dashboard/Dashboard.tsx
import { useMemo } from 'react';
import {
    Target,
    Award,
    Activity,
    BarChart3,
    TrendingUp,
    Users,
    CheckCircle,
    AlertCircle,
    Zap,
    Calendar,
    Flame
} from 'lucide-react';
import type { Todo } from '../TodoForm';

/**
 * Dashboard component props
 */
interface DashboardProps {
    stats: {
        total: number;
        completed: number;
        active: number;
        overdue: number;
    };
    todos?: Todo[];
    darkMode?: boolean;
}

/**
 * Chart data interface for weekly activity
 */
interface ChartData {
    name: string;
    completed: number;
    created: number;
    active: number;
}

/**
 * Category distribution data
 */
interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

/**
 * Priority distribution data
 */
interface PriorityData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

/**
 * Dashboard Component
 * Displays comprehensive analytics and statistics about todos
 */
export function Dashboard({ stats, todos = [], darkMode = false }: DashboardProps) {
    /**
     * Calculate completion rate percentage
     */
    const completionRate = stats.total > 0
        ? (stats.completed / stats.total) * 100
        : 0;

    /**
     * Calculate weekly productivity score
     */
    const productivityScore = useMemo(() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyCompleted = todos.filter(todo => {
            const updatedDate = new Date(todo.updatedAt);
            return todo.completed && updatedDate >= weekAgo;
        }).length;

        const weeklyCreated = todos.filter(todo => {
            const createdDate = new Date(todo.createdAt);
            return createdDate >= weekAgo;
        }).length;

        return weeklyCreated > 0
            ? Math.round((weeklyCompleted / weeklyCreated) * 100)
            : 0;
    }, [todos]);

    /**
     * Calculate current streak
     */
    const currentStreak = useMemo(() => {
        if (todos.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);

            const hasCompletedTask = todos.some(todo => {
                const updatedDate = new Date(todo.updatedAt);
                updatedDate.setHours(0, 0, 0, 0);
                return todo.completed && updatedDate.getTime() === checkDate.getTime();
            });

            if (hasCompletedTask) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    }, [todos]);

    /**
     * Generate weekly activity data
     */
    const weeklyData = useMemo((): ChartData[] => {
        const data: ChartData[] = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

            const dayTodos = todos.filter(todo => {
                const todoDate = new Date(todo.createdAt);
                return todoDate.toDateString() === date.toDateString();
            });

            const dayCompleted = todos.filter(todo => {
                const updatedDate = new Date(todo.updatedAt);
                return todo.completed && updatedDate.toDateString() === date.toDateString();
            });

            data.push({
                name: dayName,
                created: dayTodos.length,
                completed: dayCompleted.length,
                active: dayTodos.filter(todo => !todo.completed).length
            });
        }

        return data;
    }, [todos]);

    /**
     * Generate category distribution data
     */
    const categoryData = useMemo((): CategoryData[] => {
        const categoryCounts: Record<string, number> = {};
        const categoryColors = [
            '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'
        ];

        todos.forEach(todo => {
            const category = todo.category || 'Uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        return Object.entries(categoryCounts)
            .map(([name, value], index) => ({
                name,
                value,
                percentage: stats.total > 0 ? Math.round((value / stats.total) * 100) : 0,
                color: categoryColors[index % categoryColors.length]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [todos, stats.total]);

    /**
     * Generate priority distribution data for active tasks
     */
    const priorityData = useMemo((): PriorityData[] => {
        const priorities = { HIGH: 0, MEDIUM: 0, LOW: 0 };

        todos.forEach(todo => {
            if (!todo.completed) {
                priorities[todo.priority]++;
            }
        });

        const total = priorities.HIGH + priorities.MEDIUM + priorities.LOW;

        return [
            {
                name: 'High',
                value: priorities.HIGH,
                color: '#EF4444',
                percentage: total > 0 ? Math.round((priorities.HIGH / total) * 100) : 0
            },
            {
                name: 'Medium',
                value: priorities.MEDIUM,
                color: '#F59E0B',
                percentage: total > 0 ? Math.round((priorities.MEDIUM / total) * 100) : 0
            },
            {
                name: 'Low',
                value: priorities.LOW,
                color: '#10B981',
                percentage: total > 0 ? Math.round((priorities.LOW / total) * 100) : 0
            }
        ].filter(item => item.value > 0);
    }, [todos]);

    // Styling classes
    const cardClasses = darkMode
        ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm'
        : 'bg-white/50 border-gray-200 backdrop-blur-sm';

    /**
     * Custom Progress Bar Component
     */
    const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
                className="h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                }}
            />
        </div>
    );

    /**
     * Mini Bar Chart Component for weekly activity
     * Minimal and responsive design
     */
    const MiniBarChart = ({ data, maxValue }: { data: ChartData[]; maxValue: number }) => (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-end justify-between min-w-[280px] h-24 gap-1 sm:gap-2 px-1">
                {data.map((item, index) => {
                    const totalTasks = item.created + item.completed;
                    const percentage = maxValue > 0 ? (totalTasks / maxValue) * 100 : 0;
                    const barHeight = Math.max(percentage * 0.8, totalTasks > 0 ? 8 : 0);

                    return (
                        <div key={index} className="flex flex-col items-center gap-1.5 flex-1 min-w-0 group">
                            {/* Single unified bar */}
                            <div className="w-full flex flex-col items-center">
                                <div
                                    className="w-full max-w-[40px] sm:max-w-none bg-gradient-to-t from-blue-600 via-blue-500 to-green-400 rounded-md transition-all duration-300 hover:opacity-80 cursor-pointer shadow-sm hover:shadow-md"
                                    style={{
                                        height: `${barHeight}px`,
                                        minHeight: totalTasks > 0 ? '8px' : '4px'
                                    }}
                                    title={`${item.name}: ${item.completed} completed, ${item.created} created`}
                                />
                            </div>
                            {/* Day label - FIXED: Added better text colors for dark mode */}
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors truncate w-full text-center">
                                {item.name}
                            </span>
                            {/* Optional: Show count on hover */}
                            <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {totalTasks}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const maxWeeklyValue = Math.max(...weeklyData.map(d => Math.max(d.created, d.completed)), 1);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate Card */}
                <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {completionRate.toFixed(0)}%
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center shadow-sm">
                            <Target className="w-7 h-7 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <ProgressBar percentage={completionRate} color="#10B981" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {stats.completed} of {stats.total} tasks completed
                    </p>
                </div>

                {/* Weekly Productivity Score */}
                <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Score</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                {productivityScore}%
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center shadow-sm">
                            <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last 7 days performance
                        </p>
                    </div>
                </div>

                {/* Active Tasks Card */}
                <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                                {stats.active}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center shadow-sm">
                            <Activity className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.overdue > 0
                            ? `${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''}`
                            : 'All tasks on track'}
                    </p>
                </div>

                {/* Current Streak Card */}
                <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {currentStreak}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center shadow-sm">
                            <Flame className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentStreak > 0 ? 'Keep it going!' : 'Start your streak today!'}
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity Chart - FIXED TEXT COLORS */}
                <div className={`p-4 sm:p-6 rounded-xl border ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Weekly Activity</h3>
                        </div>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                    </div>

                    <MiniBarChart data={weeklyData} maxValue={maxWeeklyValue} />

                    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-600 to-green-400 rounded flex-shrink-0"></div>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Activity</span>
                        </div>
                    </div>
                </div>

                {/* Priority Distribution - FIXED TEXT COLORS */}
                <div className={`p-4 sm:p-6 rounded-xl border ${cardClasses}`}>
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Priority Distribution</h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        {priorityData.map((priority, index) => (
                            <div key={index} className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{priority.name} Priority</span>
                                    <span className="font-bold" style={{ color: priority.color }}>
                                        {priority.value} ({priority.percentage}%)
                                    </span>
                                </div>
                                <ProgressBar percentage={priority.percentage} color={priority.color} />
                            </div>
                        ))}
                        {priorityData.length === 0 && (
                            <div className="text-center py-8 sm:py-12">
                                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No active tasks</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Distribution - FIXED TEXT COLORS */}
            <div className={`p-4 sm:p-6 rounded-xl border ${cardClasses}`}>
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Tasks by Category</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {categoryData.map((category, index) => (
                        <div key={index} className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                                <span className="font-semibold truncate text-sm sm:text-base text-gray-900 dark:text-gray-100">
                                    {category.name}
                                </span>
                                <span className="text-xs sm:text-sm font-bold px-2 py-1 rounded-full bg-white dark:bg-gray-800"
                                      style={{ color: category.color }}>
                                    {category.value}
                                </span>
                            </div>
                            <ProgressBar percentage={category.percentage} color={category.color} />
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1.5 sm:mt-2">
                                {category.percentage}% of total
                            </p>
                        </div>
                    ))}
                    {categoryData.length === 0 && (
                        <div className="col-span-full text-center py-8 sm:py-12">
                            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className={`p-4 sm:p-6 rounded-xl border ${cardClasses}`}>
                <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{categoryData.length}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Categories</p>
                    </div>
                    <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                            {Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Rate</p>
                    </div>
                    <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {todos.filter(t => t.dueDate).length}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">With Due Date</p>
                    </div>
                    <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {categoryData.length > 0 ? Math.round(stats.total / categoryData.length) : 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Avg per Category</p>
                    </div>
                </div>
            </div>
        </div>
    );
}