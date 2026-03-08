export const getAnimationConfig = (animationMode: 'Minimal' | 'Professional' | 'Friendly' | 'Dynamic') => {
    switch (animationMode) {
      case 'Minimal':
        return {
          container: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } },
          event: { whileHover: { scale: 1 }, transition: { duration: 0.1 } },
          modal: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
        };
      case 'Friendly':
        return {
          container: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring' as const, bounce: 0.4 } },
          event: { whileHover: { scale: 1.05, y: -2 }, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
          modal: { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, transition: { type: 'spring' as const, bounce: 0.3 } }
        };
      case 'Dynamic':
        return {
          container: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
          event: { whileHover: { scale: 1.08, rotate: [-1, 1, 0] }, transition: { type: 'spring' as const, stiffness: 300, damping: 15 } },
          modal: { initial: { opacity: 0, scale: 0.9, rotateX: 10 }, animate: { opacity: 1, scale: 1, rotateX: 0 }, exit: { opacity: 0, scale: 0.9, rotateX: -10 }, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } }
        };
      case 'Professional':
      default:
        return {
          container: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' as const } },
          event: { whileHover: { scale: 1.02, y: -1 }, transition: { duration: 0.2, ease: 'easeOut' as const } },
          modal: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, transition: { duration: 0.3, ease: 'easeInOut' as const } }
        };
    }
  };

export const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
export const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
export const formatDateHeader = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

export const formatTimeForInput = (timeStr: string) => {
    try {
        if (timeStr === 'All Day') return '09:00';
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12' && modifier === 'AM') hours = '00';
        else if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours, 10) + 12).toString();
        return `${hours.padStart(2, '0')}:${minutes}`;
    } catch (e) { return '09:00'; }
};

export const isEventStartingSoon = (dateStr: string, timeStr: string, todayStr: string) => {
    if (dateStr !== todayStr || timeStr === 'All Day') return false;
    
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      let h = parseInt(hours, 10);
      if (modifier === 'PM' && h !== 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      
      const eventTime = new Date();
      eventTime.setHours(h, parseInt(minutes, 10), 0, 0);
      
      const now = new Date();
      const diffMs = eventTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      return diffMins > 0 && diffMins <= 30; // Starting in next 30 mins
    } catch (e) {
      return false;
    }
};
