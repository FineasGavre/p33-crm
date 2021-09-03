/* 
    Main entrypoint
*/
;(function () {
    // Data access
    const retrieveEmployeeArray = () => {
        const storedData = localStorage.getItem('employees')

        if (storedData === null) {
            return []
        } else {
            return JSON.parse(storedData)
        }
    }

    const saveEmployeeArray = (employees) => {
        localStorage.setItem('employees', JSON.stringify(employees))
    }

    const addNewEmployee = (employee) => {
        const employees = retrieveEmployeeArray()
        employees.push(employee)
        saveEmployeeArray(employees)
    }

    // UI display methods
    const retrieveAndDisplayEmployees = () => {
        const employees = retrieveEmployeeArray()
        updateEmployeeTableUI(employees)
    }

    const updateEmployeeTableUI = (employees) => {
        const tableBodyElem = document.querySelector('#employeesTable tbody')
        tableBodyElem.innerHTML = ''

        for (const employee of employees) {
            tableBodyElem.appendChild(createEmployeeTableRow(employee))
        }
    }

    const createEmployeeTableRow = (employee) => {
        const { firstName, lastName, email, sex } = employee
        const row = document.createElement('tr')

        const photoTd = document.createElement('td')

        const nameTd = document.createElement('td')
        nameTd.textContent = `${firstName} ${lastName}`

        const emailTd = document.createElement('td')
        emailTd.textContent = email

        const sexTd = document.createElement('td')
        sexTd.textContent = sex

        const birthdateTd = document.createElement('td')

        const actionsTd = document.createElement('td')

        row.append(photoTd, nameTd, emailTd, sexTd, birthdateTd, actionsTd)
        return row
    }

    // Validation
    const validateEmployeeObject = (employee) => {
        const { firstName, lastName, email, sex } = employee
        const validationResponse = {
            isValid: true,
            errors: [],
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
        }

        if (sex == null || sex == '') {
            validationResponse.isValid = false
            validationResponse.errors.push('Sex must be selected!')
        }

        if (date == null || !isValidDate(date)) {
            validationResponse.isValid = false
            validationResponse.errors.push('Birthdate must be entered.')
        }

        return validationResponse
    }

    // Helpers
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date)
    }

    // Event Handlers
    const onAddEmployeeButtonClick = () => {
        const { value: firstName } = document.querySelector('#firstName')
        const { value: lastName } = document.querySelector('#lastName')
        const { value: email } = document.querySelector('#email')
        const { value: sex } = document.querySelector('#sex')
        const { value: birthdateString } = document.querySelector('#birthdate')

        const birthdate = new Date(birthdateString)

        const employee = {
            firstName,
            lastName,
            email,
            sex,
            birthdate,
        }

        const validation = validateEmployeeObject(employee)

        if (validation.isValid) {
            addNewEmployee(employee)
            retrieveAndDisplayEmployees()
        } else {
            console.log('Invalid employee object.', validation.errors)
        }
    }

    const addEventListeners = () => {
        const addEmployeeButtonElem = document.querySelector('#addEmployeeButton')
        addEmployeeButtonElem.addEventListener('click', onAddEmployeeButtonClick)
    }

    addEventListeners()
    retrieveAndDisplayEmployees()
})()
