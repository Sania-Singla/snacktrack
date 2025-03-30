/**
 * Generic Utility to validate the regular expressions
 * @param {String} name - Key name to validate.
 * @param {String} value - Value for the key.
 * @param {Function} setError - State function to set the corresponding error or an empty string "".
 */

export default function verifyExpression(name, value, setError) {
    if (value) {
        switch (name) {
            case 'email': {
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,100}$/.test(
                    value
                )
                    ? setError((prevError) => ({ ...prevError, [name]: '' }))
                    : setError((prevError) => ({
                          ...prevError,
                          [name]: 'please enter a valid email.',
                      }));
                break;
            }

            case 'fullName':
            case 'name':
            case 'category': {
                /^[a-zA-Z ]{1,20}$/.test(value)
                    ? setError((prevError) => ({ ...prevError, [name]: '' }))
                    : setError((prevError) => ({
                          ...prevError,
                          [name]: `only letters & spaces are allowed under 20 characters.`,
                      }));
                break;
            }

            case 'rollNo': {
                /^[0-9]{1,3}$/.test(value)
                    ? setError((prevError) => ({ ...prevError, [name]: '' }))
                    : setError((prevError) => ({
                          ...prevError,
                          [name]: `only numbers are allowed under 3 characters.`,
                      }));
                break;
            }

            case 'phoneNumber': {
                /^[0-9]{10}$/.test(value)
                    ? setError((prevError) => ({ ...prevError, [name]: '' }))
                    : setError((prevError) => ({
                          ...prevError,
                          [name]: `Enter a valid phone number.`,
                      }));
                break;
            }

            case 'password':
            case 'newPassword':
            case 'contractorPassword': {
                value.length >= 8 && value.length <= 12
                    ? setError((prevError) => ({ ...prevError, [name]: '' }))
                    : setError((prevError) => ({
                          ...prevError,
                          [name]: `password must be 8-12 characters.`,
                      }));
                break;
            }

            case 'kitchenKey': {
                // hostelType + hostelNumber + kitchenPassword
                /^[A-Z]{2}\d{2}[a-zA-Z0-9]{4,12}$/.test(value)
                    ? setError((prevError) => ({ ...prevError, [name]: '' }))
                    : setError((prevError) => ({
                          ...prevError,
                          [name]: `key must be 4-12 characters.`,
                      }));
            }

            default: {
                console.log("Doesn't have a defined regex.");
                return;
            }
        }
    }
}
