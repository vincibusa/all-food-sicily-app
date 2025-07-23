import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService, UserProfile } from './auth.service';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      const inAuthGroup = segments[0] === '(tabs)';
      
      if (!currentUser && inAuthGroup) {
        router.replace('/login');
      } else if (currentUser && !inAuthGroup && segments[0] !== 'login') {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading };
}