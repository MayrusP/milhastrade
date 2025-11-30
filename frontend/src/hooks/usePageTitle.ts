import { useEffect } from 'react';

export const usePageTitle = (title: string, unreadCount?: number) => {
  useEffect(() => {
    const baseTitle = title || 'MilhasTrade';
    const prefix = unreadCount && unreadCount > 0 ? `(${unreadCount}) ` : '';
    document.title = `${prefix}${baseTitle}`;
    
    return () => {
      document.title = 'MilhasTrade';
    };
  }, [title, unreadCount]);
};
