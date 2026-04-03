import { useEffect } from 'react';
import { router } from 'expo-router';

// Redirect to weekly plan (shopping list is now integrated there)
export default function ShoppingListRedirect() {
  useEffect(() => {
    router.replace('/weekly-plan');
  }, []);
  return null;
}
