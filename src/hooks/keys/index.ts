export const dashboardKeys = {
    all: ['dashboard'] as const,
    overview: () => [...dashboardKeys.all, 'overview'] as const,
    map: (filters?: any) => [...dashboardKeys.all, 'map', filters] as const,
    hazards: () => [...dashboardKeys.all, 'hazards'] as const,
    hazardDetail: (id: number) => [...dashboardKeys.all, 'hazards', 'detail', id] as const,
    infrastructureDetail: (id: number) => [...dashboardKeys.all, 'infrastructure', 'detail', id] as const,
}
