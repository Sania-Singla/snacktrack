import { MAX_FILE_SIZE, ALLOWED_EXT } from '../Constants/constants';

/**
 * Utility to restric file sizes and allowed extensions
 * @param {File} file - File to validate.
 * @param {String} name - Key name to validate accordingly.
 * @param {Function} setError - State function to set the corresponding error or an empty string "".
 */

export function fileRestrictions(file) {
    if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const fileSizeMB = file.size / (1024 * 1024);
        if (!ALLOWED_EXT.includes(extension) || fileSizeMB > MAX_FILE_SIZE) {
            return false;
        }
        return true;
    } else {
        return 'file is missing';
    }
}
