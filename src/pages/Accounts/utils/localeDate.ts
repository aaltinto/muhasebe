
 export const localeDate = (date: string) => {
    return (new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }))
  }