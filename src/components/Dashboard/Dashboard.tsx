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
    Flame,
    TrendingDown,
    Clock
} from 'lucide-react';
import type { Todo } from '../TodoForm';

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

interface ChartData {
    name: string;
    completed: number;
    created: number;
    active: number;
}

interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

interface PriorityData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

/**
 * Professional Dashboard Component
 */
export function Dashboard({ stats, todos = [], darkMode = false }: DashboardProps) {
    // Calculate completion rate
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    // Calculate weekly productivity
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

        return weeklyCreated > 0 ? Math.round((weeklyCompleted / weeklyCreated) * 100) : 0;
    }, [todos]);

    // Calculate streak
    const streak = useMemo(() => {
        const today = new Date();
        let currentStreak = 0;
        let checkDate = new Date(today);

        while (true) {
            const dayStart = new Date(checkDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(checkDate);
            dayEnd.setHours(23, 59, 59, 999);

            const completedToday = todos.some(todo => {
                if (!todo.completed) return false;
                const completedDate = new Date(todo.updatedAt);
                return completedDate >= dayStart && completedDate <= dayEnd;
            });

            if (completedToday) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return currentStreak;
    }, [todos]);

    // Weekly activity data
    const weeklyData = useMemo((): ChartData[] => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data: ChartData[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const completed = todos.filter(todo => {
                const updatedDate = new Date(todo.updatedAt);
                return todo.completed && updatedDate >= dayStart && updatedDate <= dayEnd;
            }).length;

            const created = todos.filter(todo => {
                const createdDate = new Date(todo.createdAt);
                return createdDate >= dayStart && createdDate <= dayEnd;
            }).length;

            data.push({
                name: days[date.getDay()],
                completed,
                created,
                active: created - completed
            });
        }

        return data;
    }, [todos]);

    // Category distribution
    const categoryData = useMemo((): CategoryData[] => {
        const categoryColors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
        ];

        const categoryMap = new Map<string, number>();
        todos.forEach(todo => {
            if (todo.category) {
                categoryMap.set(todo.category, (categoryMap.get(todo.category) || 0) + 1);
            }
        });

        return Array.from(categoryMap.entries())
            .map(([name, value], index) => ({
                name,
                value,
                percentage: stats.total > 0 ? Math.round((value / stats.total) * 100) : 0,
                color: categoryColors[index % categoryColors.length]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [todos, stats.total]);

    // Priority distribution
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

    const maxWeeklyValue = Math.max(...weeklyData.map(d => d.created + d.completed), 1);

    // Styling
    const cardClasses = darkMode
        ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm'
        : 'bg-white border-gray-200';

    // Progress Bar Component
    const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
                className="h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                }}
            />
        </div>
    );

    // Mini Bar Chart Component
    const MiniBarChart = ({ data, maxValue }: { data: ChartData[]; maxValue: number }) => (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-end justify-between min-w-[280px] h-32 gap-2 px-1">
                {data.map((item, index) => {
                    const totalTasks = item.created + item.completed;
                    const percentage = maxValue > 0 ? (totalTasks / maxValue) * 100 : 0;
                    const barHeight = Math.max(percentage * 1.2, totalTasks > 0 ? 12 : 4);

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 min-w-0 group">
                            <div className="w-full flex flex-col items-center">
                                <div
                                    className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 via-indigo-500 to-purple-500 rounded-lg transition-all duration-300 hover:opacity-80 cursor-pointer shadow-lg hover:shadow-xl group-hover:scale-105"
                                    style={{
                                        height: `${barHeight}px`,
                                        minHeight: totalTasks > 0 ? '12px' : '4px'
                                    }}
                                    title={`${item.name}: ${item.completed} completed, ${item.created} created`}
                                />
                            </div>
                            <span className={`text-xs font-semibold transition-colors ${
                                darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-900'
                            }`}>
                                {item.name}
                            </span>
                            <span className={`text-xs font-bold transition-opacity opacity-0 group-hover:opacity-100 ${
                                darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                {totalTasks}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Completion Rate
                            </p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                                {completionRate.toFixed(0)}%
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <ProgressBar percentage={completionRate} color="#10B981" />
                    <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {stats.completed} of {stats.total} tasks completed
                    </p>
                </div>

                {/* Weekly Score */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Weekly Score
                            </p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                                {productivityScore}%
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <ProgressBar percentage={productivityScore} color="#3B82F6" />
                    <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {weeklyData.reduce((sum, d) => sum + d.completed, 0)} tasks this week
                    </p>
                </div>

                {/* Active Tasks */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Active Tasks
                            </p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                                {stats.active}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex-1">
                            <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                In Progress
                            </div>
                            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats.active}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue & Streak */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Current Streak
                            </p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mt-2">
                                {streak} 🔥
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-200 dark:from-orange-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        {stats.overdue > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className={`text-sm font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    {stats.overdue} overdue
                                </span>
                            </div>
                        )}
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {streak > 0 ? 'Keep it going!' : 'Start your streak today!'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <div className={`p-6 rounded-2xl border-2 ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center shadow-md">
                                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Weekly Activity
                                </h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Last 7 days
                                </p>
                            </div>
                        </div>
                        <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                    </div>

                    <MiniBarChart data={weeklyData} maxValue={maxWeeklyValue} />

                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-purple-500 rounded"></div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Activity
                            </span>
                        </div>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className={`p-6 rounded-2xl border-2 ${cardClasses}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/30 dark:to-rose-800/30 rounded-xl flex items-center justify-center shadow-md">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Priority Distribution
                            </h3>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Active tasks only
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {priorityData.map((priority, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: priority.color }}
                                        />
                                        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {priority.name} Priority
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: priority.color }}
                                        >
                                            {priority.value}
                                        </span>
                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            ({priority.percentage}%)
                                        </span>
                                    </div>
                                </div>
                                <ProgressBar percentage={priority.percentage} color={priority.color} />
                            </div>
                        ))}
                        {priorityData.length === 0 && (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No active tasks
                                </p>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    All caught up! 🎉
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Distribution */}
            <div className={`p-6 rounded-2xl border-2 ${cardClasses}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center shadow-md">
                        <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tasks by Category
                        </h3>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Top 6 categories
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryData.map((category, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 ${
                                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {category.name}
                                </span>
                                <span
                                    className="text-sm font-bold px-2.5 py-1 rounded-lg"
                                    style={{
                                        color: category.color,
                                        backgroundColor: `${category.color}20`
                                    }}
                                >
                                    {category.value}
                                </span>
                            </div>
                            <ProgressBar percentage={category.percentage} color={category.color} />
                            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {category.percentage}% of total tasks
                            </p>
                        </div>
                    ))}
                    {categoryData.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No categories yet
                            </p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Create tasks to see category distribution
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className={`p-6 rounded-2xl border-2 ${cardClasses}`}>
                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Award className="w-6 h-6 text-yellow-500" />
                    Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {categoryData.length}
                        </p>
                        <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Categories
                        </p>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800/30">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%
                        </p>
                        <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Overall Rate
                        </p>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {todos.filter(t => t.dueDate).length}
                        </p>
                        <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            With Due Date
                        </p>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800/30">
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {categoryData.length > 0 ? Math.round(stats.total / categoryData.length) : 0}
                        </p>
                        <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Avg per Category
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}