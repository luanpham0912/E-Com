import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/apis/usersApi';
import { queryKeys } from '@/lib/queryKeys';
import type { UserRole } from '@/lib/types';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () => usersApi.list(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      email?: string;
      role?: UserRole;
      password?: string;
    }) => usersApi.update(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.setQueryData(queryKeys.users.detail(variables.id), _data);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
