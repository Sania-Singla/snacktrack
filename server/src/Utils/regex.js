import fs from 'fs';
import { MAX_FILE_SIZE, ALLOWED_EXT } from '../Constants/index.js';

/**
 * Generic Utility to validate the regular expressions
 * @param {String} name - Key name to validate.
 * @param {String} value - Value/File for the key.
 * @returns {Boolean} Boolean.
 */
export default function verifyRegex(name, value) {
    if (value) {
        switch (name) {
            case 'fullName':
            case 'name': {
                return /^[a-zA-Z ]{1,20}$/.test(value);
            }

            case 'email': {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,100}$/.test(
                    value
                );
            }

            case 'hostelNumber':
            case 'rollNo': {
                return /^\d+$/.test(value);
            }

            case 'hostelType': {
                return value === 'GH' || value === 'BH' || value === 'IH';
            }

            case 'password': {
                return value.length >= 8 && value.length <= 12;
            }

            case 'kitchenKey': {
                // hostelType + hostelNumber + kitchenPassword
                return /^[A-Z]{2}\d{2}[a-zA-Z0-9]{4,12}$/.test(value);
            }

            case 'phoneNumber': {
                return /^[0-9]{10}$/.test(value);
            }

            case 'file': {
                if (fs.existsSync(value)) {
                    try {
                        const stats = fs.statSync(value);
                        const fileSizeMB = stats.size / (1024 * 1024);
                        const extension = value.split('.').pop().toLowerCase();

                        return (
                            ALLOWED_EXT.includes(extension) &&
                            fileSizeMB <= MAX_FILE_SIZE
                        );
                    } catch (err) {
                        console.error('Error accessing file:', err);
                        return false;
                    }
                } else {
                    console.log('File does not exist:', value);
                    return false;
                }
            }

            default: {
                console.log("Doesn't have a defined regex.", name);
                return false;
            }
        }
    } else {
        console.log('provide a value to validate');
        return false;
    }
}
