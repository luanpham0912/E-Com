import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cartApi } from '@/apis/ordersApi';

export function useCartSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setItems = useCartStore((s) => s.setItems);
  const reset = useCartStore((s) => s.reset);
  const prevAuthRef = useRef<boolean | null>(null);
  const prevRoleRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const wasAuth = prevAuthRef.current;
    const wasRole = prevRoleRef.current;
    const authChanged = wasAuth !== isAuthenticated;
    const roleChanged = wasRole !== role;
    prevAuthRef.current = isAuthenticated;
    prevRoleRef.current = role;

    if (!authChanged && !roleChanged) return;

    if (isAuthenticated && role === 'customer') {
      cartApi
        .get()
        .then(({ items: serverItems }) => {
          setItems(serverItems ?? []);
        })
        .catch(() => {});
    } else if (wasAuth === true && !isAuthenticated) {
      reset();
    }
  }, [isAuthenticated, role, isLoading, setItems, reset]);
}
