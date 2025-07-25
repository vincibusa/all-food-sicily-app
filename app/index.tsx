import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Aspetta che il layout sia montato prima di navigare
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  // Non renderizziamo nulla, solo redirect
  return null;
} 