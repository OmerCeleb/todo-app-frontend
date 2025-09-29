// src/utils/todoTemplates.ts
import type { TodoFormData } from '../components/TodoForm';

export interface TodoTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tasks: Omit<TodoFormData, 'title'>[];
    taskTitles: string[];
    tags: string[];
    estimatedTime?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export const predefinedTemplates: TodoTemplate[] = [
    // Development Templates
    {
        id: 'daily-standup',
        name: 'Daily Standup',
        description: 'Prepare for daily team standup meeting',
        icon: '🗣️',
        category: 'Development',
        estimatedTime: '15 min',
        difficulty: 'easy',
        tags: ['meeting', 'team', 'daily'],
        taskTitles: [
            'Review yesterday\'s work',
            'Identify today\'s priorities',
            'Check for blockers',
            'Update task status'
        ],
        tasks: [
            {
                description: 'Go through completed tasks from yesterday and prepare summary',
                priority: 'MEDIUM',
                category: 'Development',
                dueDate: ''
            },
            {
                description: 'List 2-3 main tasks for today with time estimates',
                priority: 'HIGH',
                category: 'Development',
                dueDate: ''
            },
            {
                description: 'Identify any dependencies or blockers that need team help',
                priority: 'MEDIUM',
                category: 'Development',
                dueDate: ''
            },
            {
                description: 'Update JIRA/project management tool with current status',
                priority: 'LOW',
                category: 'Development',
                dueDate: ''
            }
        ]
    },
    {
        id: 'code-review',
        name: 'Code Review Process',
        description: 'Complete code review checklist',
        icon: '👀',
        category: 'Development',
        estimatedTime: '30 min',
        difficulty: 'medium',
        tags: ['review', 'quality', 'code'],
        taskTitles: [
            'Check code functionality',
            'Review test coverage',
            'Verify documentation',
            'Test edge cases',
            'Leave constructive feedback'
        ],
        tasks: [
            {
                description: 'Ensure code meets functional requirements',
                priority: 'HIGH',
                category: 'Development',
                dueDate: ''
            },
            {
                description: 'Verify unit tests exist and cover main scenarios',
                priority: 'HIGH',
                category: 'Testing',
                dueDate: ''
            },
            {
                description: 'Check if code is properly documented',
                priority: 'MEDIUM',
                category: 'Documentation',
                dueDate: ''
            },
            {
                description: 'Test with invalid inputs and boundary conditions',
                priority: 'MEDIUM',
                category: 'Testing',
                dueDate: ''
            },
            {
                description: 'Provide clear, actionable feedback for improvements',
                priority: 'LOW',
                category: 'Development',
                dueDate: ''
            }
        ]
    },
    {
        id: 'new-feature',
        name: 'New Feature Development',
        description: 'Complete workflow for developing a new feature',
        icon: '⭐',
        category: 'Development',
        estimatedTime: '2-3 days',
        difficulty: 'hard',
        tags: ['feature', 'development', 'planning'],
        taskTitles: [
            'Define requirements',
            'Create technical design',
            'Set up development environment',
            'Implement core functionality',
            'Write tests',
            'Update documentation',
            'Create pull request'
        ],
        tasks: [
            {
                description: 'Document feature requirements and acceptance criteria',
                priority: 'HIGH',
                category: 'Planning',
                dueDate: ''
            },
            {
                description: 'Design technical approach and architecture',
                priority: 'HIGH',
                category: 'Architecture',
                dueDate: ''
            },
            {
                description: 'Set up branch and development environment',
                priority: 'MEDIUM',
                category: 'Development',
                dueDate: ''
            },
            {
                description: 'Implement main feature functionality',
                priority: 'HIGH',
                category: 'Development',
                dueDate: ''
            },
            {
                description: 'Write unit and integration tests',
                priority: 'HIGH',
                category: 'Testing',
                dueDate: ''
            },
            {
                description: 'Update README and API documentation',
                priority: 'MEDIUM',
                category: 'Documentation',
                dueDate: ''
            },
            {
                description: 'Create PR with detailed description',
                priority: 'MEDIUM',
                category: 'Development',
                dueDate: ''
            }
        ]
    },

    // Design Templates
    {
        id: 'ui-component',
        name: 'UI Component Design',
        description: 'Design process for creating a new UI component',
        icon: '🎨',
        category: 'Design',
        estimatedTime: '1-2 hours',
        difficulty: 'medium',
        tags: ['ui', 'component', 'design'],
        taskTitles: [
            'Research existing patterns',
            'Create wireframes',
            'Design variations',
            'Build interactive prototype',
            'Get feedback'
        ],
        tasks: [
            {
                description: 'Research similar components in design systems',
                priority: 'MEDIUM',
                category: 'Research',
                dueDate: ''
            },
            {
                description: 'Sketch low-fidelity wireframes',
                priority: 'HIGH',
                category: 'Design',
                dueDate: ''
            },
            {
                description: 'Create different state variations (hover, active, disabled)',
                priority: 'HIGH',
                category: 'Design',
                dueDate: ''
            },
            {
                description: 'Build clickable prototype in Figma',
                priority: 'MEDIUM',
                category: 'Design',
                dueDate: ''
            },
            {
                description: 'Share with team for feedback and iteration',
                priority: 'MEDIUM',
                category: 'Design',
                dueDate: ''
            }
        ]
    },

    // Business Templates
    {
        id: 'client-meeting',
        name: 'Client Meeting Preparation',
        description: 'Prepare for important client meeting',
        icon: '🤝',
        category: 'Business',
        estimatedTime: '45 min',
        difficulty: 'medium',
        tags: ['meeting', 'client', 'preparation'],
        taskTitles: [
            'Review project status',
            'Prepare agenda',
            'Gather supporting materials',
            'Anticipate questions',
            'Set meeting objectives'
        ],
        tasks: [
            {
                description: 'Review current project progress and milestones',
                priority: 'HIGH',
                category: 'Business',
                dueDate: ''
            },
            {
                description: 'Create structured meeting agenda with time slots',
                priority: 'HIGH',
                category: 'Planning',
                dueDate: ''
            },
            {
                description: 'Prepare demos, reports, and visual materials',
                priority: 'MEDIUM',
                category: 'Business',
                dueDate: ''
            },
            {
                description: 'Think through potential client questions and concerns',
                priority: 'MEDIUM',
                category: 'Planning',
                dueDate: ''
            },
            {
                description: 'Define clear meeting objectives and desired outcomes',
                priority: 'HIGH',
                category: 'Business',
                dueDate: ''
            }
        ]
    },

    // Personal Templates
    {
        id: 'learning-goal',
        name: 'Learning New Technology',
        description: 'Structured approach to learning a new technology',
        icon: '📚',
        category: 'Personal',
        estimatedTime: '1-2 weeks',
        difficulty: 'medium',
        tags: ['learning', 'skill', 'technology'],
        taskTitles: [
            'Research technology overview',
            'Find learning resources',
            'Set up practice environment',
            'Build sample project',
            'Join community',
            'Document learnings'
        ],
        tasks: [
            {
                description: 'Read documentation and understand core concepts',
                priority: 'HIGH',
                category: 'Personal',
                dueDate: ''
            },
            {
                description: 'Find tutorials, courses, and practice materials',
                priority: 'HIGH',
                category: 'Personal',
                dueDate: ''
            },
            {
                description: 'Install tools and set up development environment',
                priority: 'MEDIUM',
                category: 'Personal',
                dueDate: ''
            },
            {
                description: 'Build a small project to practice concepts',
                priority: 'HIGH',
                category: 'Personal',
                dueDate: ''
            },
            {
                description: 'Join forums, Discord, or community groups',
                priority: 'LOW',
                category: 'Personal',
                dueDate: ''
            },
            {
                description: 'Write blog post or notes about key learnings',
                priority: 'MEDIUM',
                category: 'Personal',
                dueDate: ''
            }
        ]
    },

    // DevOps Templates
    {
        id: 'deployment',
        name: 'Production Deployment',
        description: 'Safe deployment checklist for production',
        icon: '🚀',
        category: 'DevOps',
        estimatedTime: '1 hour',
        difficulty: 'hard',
        tags: ['deployment', 'production', 'release'],
        taskTitles: [
            'Run final tests',
            'Backup current version',
            'Deploy to staging',
            'Verify staging works',
            'Deploy to production',
            'Monitor and verify',
            'Update documentation'
        ],
        tasks: [
            {
                description: 'Run full test suite and ensure all tests pass',
                priority: 'HIGH',
                category: 'Testing',
                dueDate: ''
            },
            {
                description: 'Create backup of current production version',
                priority: 'HIGH',
                category: 'DevOps',
                dueDate: ''
            },
            {
                description: 'Deploy changes to staging environment',
                priority: 'HIGH',
                category: 'DevOps',
                dueDate: ''
            },
            {
                description: 'Test all critical functionality in staging',
                priority: 'HIGH',
                category: 'Testing',
                dueDate: ''
            },
            {
                description: 'Deploy to production environment',
                priority: 'HIGH',
                category: 'DevOps',
                dueDate: ''
            },
            {
                description: 'Monitor logs, metrics, and user feedback',
                priority: 'HIGH',
                category: 'DevOps',
                dueDate: ''
            },
            {
                description: 'Update deployment logs and version documentation',
                priority: 'LOW',
                category: 'Documentation',
                dueDate: ''
            }
        ]
    }
];

// Template management class
export class TodoTemplatesManager {
    private static STORAGE_KEY = 'todo-templates';
    private static USAGE_KEY = 'template-usage';

    static getCustomTemplates(): TodoTemplate[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load custom templates:', error);
            return [];
        }
    }

    static getAllTemplates(): TodoTemplate[] {
        return [...predefinedTemplates, ...this.getCustomTemplates()];
    }

    static saveCustomTemplate(template: TodoTemplate): void {
        try {
            const customTemplates = this.getCustomTemplates();
            const existingIndex = customTemplates.findIndex(t => t.id === template.id);

            if (existingIndex >= 0) {
                customTemplates[existingIndex] = template;
            } else {
                customTemplates.push(template);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
        } catch (error) {
            console.warn('Failed to save template:', error);
        }
    }

    static deleteCustomTemplate(templateId: string): void {
        try {
            const customTemplates = this.getCustomTemplates();
            const filtered = customTemplates.filter(t => t.id !== templateId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.warn('Failed to delete template:', error);
        }
    }

    static getTemplateById(id: string): TodoTemplate | null {
        return this.getAllTemplates().find(t => t.id === id) || null;
    }

    static getTemplatesByCategory(category: string): TodoTemplate[] {
        return this.getAllTemplates().filter(t => t.category === category);
    }

    static getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TodoTemplate[] {
        return this.getAllTemplates().filter(t => t.difficulty === difficulty);
    }

    static searchTemplates(query: string): TodoTemplate[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllTemplates().filter(template =>
            template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            template.taskTitles.some(title => title.toLowerCase().includes(lowerQuery))
        );
    }

    // Usage tracking
    static trackTemplateUsage(templateId: string): void {
        try {
            const usage = this.getTemplateUsage();
            usage[templateId] = (usage[templateId] || 0) + 1;
            localStorage.setItem(this.USAGE_KEY, JSON.stringify(usage));
        } catch (error) {
            console.warn('Failed to track template usage:', error);
        }
    }

    static getTemplateUsage(): Record<string, number> {
        try {
            const stored = localStorage.getItem(this.USAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Failed to load template usage:', error);
            return {};
        }
    }

    static getMostUsedTemplates(limit: number = 5): TodoTemplate[] {
        const usage = this.getTemplateUsage();
        const templates = this.getAllTemplates();

        return templates
            .map(template => ({
                template,
                usage: usage[template.id] || 0
            }))
            .sort((a, b) => b.usage - a.usage)
            .slice(0, limit)
            .map(item => item.template);
    }

    // Export/Import
    static exportTemplates(): string {
        const customTemplates = this.getCustomTemplates();
        const usage = this.getTemplateUsage();

        return JSON.stringify({
            templates: customTemplates,
            usage: usage,
            exportDate: new Date().toISOString(),
            version: '1.0'
        }, null, 2);
    }

    static importTemplates(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);

            if (data.templates && Array.isArray(data.templates)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.templates));
            }

            if (data.usage && typeof data.usage === 'object') {
                localStorage.setItem(this.USAGE_KEY, JSON.stringify(data.usage));
            }

            return true;
        } catch (error) {
            console.error('Failed to import templates:', error);
            return false;
        }
    }

    static resetToDefaults(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.USAGE_KEY);
    }
}

// React hook for templates
import { useState, useEffect } from 'react';

export function useTodoTemplates() {
    const [templates, setTemplates] = useState<TodoTemplate[]>([]);
    const [customTemplates, setCustomTemplates] = useState<TodoTemplate[]>([]);

    useEffect(() => {
        setTemplates(TodoTemplatesManager.getAllTemplates());
        setCustomTemplates(TodoTemplatesManager.getCustomTemplates());
    }, []);

    const refreshTemplates = () => {
        setTemplates(TodoTemplatesManager.getAllTemplates());
        setCustomTemplates(TodoTemplatesManager.getCustomTemplates());
    };

    const saveTemplate = (template: TodoTemplate) => {
        TodoTemplatesManager.saveCustomTemplate(template);
        refreshTemplates();
    };

    const deleteTemplate = (templateId: string) => {
        TodoTemplatesManager.deleteCustomTemplate(templateId);
        refreshTemplates();
    };

    const useTemplate = (templateId: string) => {
        TodoTemplatesManager.trackTemplateUsage(templateId);
        return TodoTemplatesManager.getTemplateById(templateId);
    };

    const searchTemplates = (query: string) => {
        return TodoTemplatesManager.searchTemplates(query);
    };

    const getTemplatesByCategory = (category: string) => {
        return TodoTemplatesManager.getTemplatesByCategory(category);
    };

    const getMostUsedTemplates = (limit?: number) => {
        return TodoTemplatesManager.getMostUsedTemplates(limit);
    };

    return {
        templates,
        customTemplates,
        predefinedTemplates,
        saveTemplate,
        deleteTemplate,
        useTemplate,
        searchTemplates,
        getTemplatesByCategory,
        getMostUsedTemplates,
        refreshTemplates,
    };
}