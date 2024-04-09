export function deepCopy(obj: any) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
  
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
  
    if (Array.isArray(obj)) {
      return obj.reduce((arr, item, i) => {
        arr[i] = deepCopy(item);
        return arr;
      }, []);
    }
  
    if (obj instanceof Object) {
      return Object.keys(obj).reduce((newObj, key) => {
        newObj[key] = deepCopy(obj[key]);
        return newObj;
      }, {});
    }
  
    throw new Error(`Unable to copy obj! Its type isn't supported.`);
  }