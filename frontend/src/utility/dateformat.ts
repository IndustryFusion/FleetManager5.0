type InputDate = string | number | Date | null | undefined;
  export const toDate = (input: InputDate): Date | null => {
      if (input == null) return null;
  
      if (input instanceof Date) {
        return Number.isFinite(input.getTime()) ? input : null;
      }
  
      if (typeof input === 'number') {
        // accept seconds or milliseconds
        const ms = input < 1e12 ? input * 1000 : input;
        const d = new Date(ms);
        return Number.isFinite(d.getTime()) ? d : null;
      }
  
      if (typeof input === 'string') {
        const s = input.trim();
        const d = new Date(s);
        return Number.isFinite(d.getTime()) ? d : null;
      }
  
      return null;
    };