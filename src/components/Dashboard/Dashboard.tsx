// src/components/Dashboard/Dashboard.tsx - Clean Version
import { useMemo } from 'react';
import {
    Target,
    Clock,
    Award,
    Activity,
    BarChart3,
    PieChart,
    Users,
    CheckCircle
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
}

interface PriorityData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

export function Dashboard({ stats, todos = [], darkMode = false }: DashboardProps) {
    // Calculate completion rate
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    // Calculate productivity score
    const productivityScore = useMemo(() => {
        const recentTodos = todos.filter(todo => {
            const createdDate = new Date(todo.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate >= weekAgo;
        });

        const recentCompleted = recentTodos.filter(todo => todo.completed).length;
        const recentTotal = recentTodos.length;

        if (recentTotal === 0) return 0;
        return Math.round((recentCompleted / recentTotal) * 100);
    }, [todos]);

    // Generate weekly activity data
    const weeklyData = useMemo((): ChartData[] => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data: ChartData[] = [];

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

    // Generate category distribution data
    const categoryData = useMemo((): CategoryData[] => {
        const categoryCounts: Record<string, number> = {};

        todos.forEach(todo => {
            const category = todo.category || 'Uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        return Object.entries(categoryCounts)
            .map(([name, value]) => ({
                name,
                value,
                percentage: stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [todos, stats.total]);

    // Generate priority distribution data
    const priorityData = useMemo((): PriorityData[] => {
        const priorities = { high: 0, medium: 0, low: 0 };

        todos.forEach(todo => {
            if (!todo.completed) {
                priorities[todo.priority]++;
            }
        });

        const total = priorities.high + priorities.medium + priorities.low;

        return [
            {
                name: 'High',
                value: priorities.high,
                color: '#EF4444',
                percentage: total > 0 ? Math.round((priorities.high / total) * 100) : 0
            },
            {
                name: 'Medium',
                value: priorities.medium,
                color: '#F59E0B',
                percentage: total > 0 ? Math.round((priorities.medium / total) * 100) : 0
            },
            {
                name: 'Low',
                value: priorities.low,
                color: '#10B981',
                percentage: total > 0 ? Math.round((priorities.low / total) * 100) : 0
            }
        ].filter(item => item.value > 0);
    }, [todos]);

    const cardClasses = darkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200';

    // Custom Progress Bar Component
    const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                }}
            />
        </div>
    );

    // Custom Chart Components
    const MiniBarChart = ({ data, maxValue }: { data: ChartData[]; maxValue: number }) => (
        <div className="flex items-end justify-between h-24 gap-1">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex flex-col items-center w-full gap-0.5">
                        <div
                            className="w-full bg-blue-500 rounded-t"
                            style={{
                                height: maxValue > 0 ? `${(item.created / maxValue) * 60}px` : '2px',
                                minHeight: '2px'
                            }}
                        />
                        <div
                            className="w-full bg-green-500 rounded-b"
                            style={{
                                height: maxValue > 0 ? `${(item.completed / maxValue) * 60}px` : '2px',
                                minHeight: '2px'
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
            ))}
        </div>
    );

    const maxWeeklyValue = Math.max(...weeklyData.map(d => Math.max(d.created, d.completed)));

    return (
        <div className="space-y-6">
            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate */}
                <div className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                            <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <ProgressBar percentage={completionRate} color="#10B981" />
                </div>

                {/* Productivity Score */}
                <div className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Score</p>
                            <p className="text-2xl font-bold text-blue-600">{productivityScore}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Based on last 7 days
                    </p>
                </div>

                {/* Active Tasks */}
                <div className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.overdue > 0 ? `${stats.overdue} overdue` : 'All on track'}
                    </p>
                </div>

                {/* Overdue Tasks */}
                <div className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Need attention
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity Chart */}
                <div className={`p-6 rounded-lg border ${cardClasses}`}>
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Weekly Activity</h3>
                    </div>

                    <MiniBarChart data={weeklyData} maxValue={maxWeeklyValue} />

                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                        </div>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className={`p-6 rounded-lg border ${cardClasses}`}>
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Active Tasks by Priority</h3>
                    </div>

                    <div className="space-y-4">
                        {priorityData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.value} ({item.percentage}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                        {priorityData.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No active tasks
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className={`p-6 rounded-lg border ${cardClasses}`}>
                <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold">Tasks by Category</h3>
                </div>

                <div className="space-y-4">
                    {categoryData.map((category, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{category.name}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {category.value} ({category.percentage}%)
                                </span>
                            </div>
                            <ProgressBar
                                percentage={category.percentage}
                                color="#6366F1"
                            />
                        </div>
                    ))}
                    {categoryData.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No categories yet
                        </p>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className={`p-6 rounded-lg border ${cardClasses}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{categoryData.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                            {Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Overall Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                            {todos.filter(t => t.dueDate).length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">With Due Date</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                            {categoryData.length > 0 ? Math.round(stats.total / categoryData.length) : 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Category</p>
                    </div>
                </div>
            </div>
        </div>
    );
}