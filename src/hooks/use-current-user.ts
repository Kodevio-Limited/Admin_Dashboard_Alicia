import { useQuery } from '@tanstack/react-query';
import type {  UseQueryResult } from '@tanstack/react-query';
import { currentUserQueryOptions } from '@/queries/auth';
import type { ProfileData } from '@/lib/settings';

export const useCurrentUser = (): UseQueryResult<ProfileData, Error> => {
    const query = useQuery(currentUserQueryOptions());
    return query as UseQueryResult<ProfileData, Error>;
};
