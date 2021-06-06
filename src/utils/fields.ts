type KeyValue = {
  [key: string]: string
}

/**
 * 
 * @param fields 
 * @returns 
 */
export function verifyMandatoryFields(fields:  KeyValue): string | null {
  let response = null;

  Object.keys(fields).some((key: string) => {
    const field: string = fields[key];
    if (!field) {
      response = `${_capitalize(key)} is a mandatory field`;
      return true;
    }
  });

  return response;
}

/**
 * Receives a string and return the string with the first
 * letter as Capital case and the rest lower case
 * @param str String to be capitalized
 * @returns {string}
 */
function _capitalize(str: string): string {
  return str.charAt(0).toLocaleUpperCase() +
    str.slice(1).toLocaleLowerCase();
}