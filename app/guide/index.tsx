import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function GuidesRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main guide tab which has the full functionality
    router.replace('/(tabs)/guide');
  }, [router]);

  // Return null since we're immediately redirecting
  return null;
}