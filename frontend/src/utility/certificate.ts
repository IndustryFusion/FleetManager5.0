export const formatDateTime = (dateString:string) => {
    const date = new Date(dateString);
    
    // Format date (replacing '/' with '.')
    const formattedDate = date.toLocaleDateString('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.');
    
    // Format time (24-hour format)
    const formattedTime = date.toLocaleTimeString('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${formattedDate} ${formattedTime}`;
  };