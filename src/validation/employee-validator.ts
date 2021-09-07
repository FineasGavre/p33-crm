import { Employee } from '../data-access/employee.interface'
import { calculateAgeFromBirthdate, isValidDate } from '../utils/utils'

export type ValidationResult = { isValid: boolean; errors: string[] }

export class EmployeeValidator {
    validateEmployeeObject(employee: Employee) {
        const { firstName, lastName, email, sex, birthdate, profilePhoto } = employee
        const validationResponse = {
            isValid: true,
            errors: Array<string>(),
        }

        if (firstName == null || firstName == '') {
            validationResponse.isValid = false
            validationResponse.errors.push('First name must not be empty!')
        }

        if (lastName == null || lastName == '') {
            validationResponse.isValid = false
            validationResponse.errors.push('Last name must not be empty!')
        }

        if (email == null || email == '') {
            validationResponse.isValid = false
            validationResponse.errors.push('Email must not be empty!')
        } else {
            const emailRegexp =
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

            if (!emailRegexp.test(email)) {
                validationResponse.isValid = false
                validationResponse.errors.push('Email must be in the correct format!')
            }
        }

        if (sex == null || sex == '') {
            validationResponse.isValid = false
            validationResponse.errors.push('Sex must be selected!')
        }

        if (birthdate == null || !isValidDate(birthdate)) {
            validationResponse.isValid = false
            validationResponse.errors.push('Birthdate must be selected!')
        } else {
            if (calculateAgeFromBirthdate(birthdate) < 16) {
                validationResponse.isValid = false
                validationResponse.errors.push('The employee must be 16 or older!')
            }
        }

        return validationResponse
    }
}
