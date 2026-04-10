import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const code = event.code;

      // Check both key and code for flexibility (e.g., ' ' and 'Space')
      const action = shortcuts[key] || shortcuts[code];
      
      if (action) {
        // Prevent default only for specific shortcuts to avoid breaking browser behavior
        if (key === ' ' || code === 'Space' || (key >= '1' && key <= '9')) {
          event.preventDefault();
        }
        action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
