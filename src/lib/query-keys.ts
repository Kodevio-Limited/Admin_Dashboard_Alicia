export const adminKeys = {
    all: ['admin'] as const,
    
    // User Management
    users: () => [...adminKeys.all, 'users'] as const,
    residents: (filters?: Record<string, any>) => [...adminKeys.users(), 'residents', filters] as const,
    residentDetail: (phone: string) => [...adminKeys.users(), 'residents', phone] as const,
    coordinators: (filters?: Record<string, any>) => [...adminKeys.users(), 'coordinators', filters] as const,
    
    // Hubs
    hubs: (filters?: Record<string, any>) => [...adminKeys.all, 'hubs', filters] as const,
    hubDetail: (id: string) => [...adminKeys.all, 'hubs', id] as const,
    
    // Messages & Broadcasts
    messages: (filters?: Record<string, any>) => [...adminKeys.all, 'messages', filters] as const,
    messageDetail: (id: string) => [...adminKeys.all, 'messages', id] as const,
    broadcasts: () => [...adminKeys.all, 'broadcasts'] as const,
    
    // System
    overview: () => [...adminKeys.all, 'overview'] as const,
    aiConfig: () => [...adminKeys.all, 'ai-config'] as const,
};
