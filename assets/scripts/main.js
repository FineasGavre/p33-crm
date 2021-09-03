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
        const { firstName, lastName, email, sex, birthdate, profilePhoto } = employee
        const row = document.createElement('tr')

        const photoTd = document.createElement('td')
        const imageElem = document.createElement('img')
        imageElem.src = profilePhoto
        photoTd.appendChild(imageElem)

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
        const { firstName, lastName, email, sex, birthdate, profilePhoto } = employee
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

        if (birthdate == null || !isValidDate(birthdate)) {
            validationResponse.isValid = false
            validationResponse.errors.push('Birthdate must be selected!')
        }

        if (profilePhoto == null) {
            validationResponse.isValid = false
            validationResponse.errors.push('Profile photo must be selected!')
        }

        return validationResponse
    }

    // Helpers
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date)
    }

    const readFileToDataUrl = (file, callback) => {
        const reader = new FileReader()

        reader.addEventListener('load', (event) => {
            callback(event.target.result)
        })

        try {
            reader.readAsDataURL(file)
            return true
        } catch (err) {
            return false
        }
    }

    // Event Handlers
    const onAddEmployeeButtonClick = () => {
        const { value: firstName } = document.querySelector('#firstName')
        const { value: lastName } = document.querySelector('#lastName')
        const { value: email } = document.querySelector('#email')
        const { value: sex } = document.querySelector('#sex')
        const { value: birthdateString } = document.querySelector('#birthdate')
        const {
            files: [uploadedPhoto],
        } = document.querySelector('#picture')

        const birthdate = new Date(birthdateString)

        const photoProcessedCallback = (profilePhoto) => {
            const employee = {
                firstName,
                lastName,
                email,
                sex,
                birthdate,
                profilePhoto,
            }

            const validation = validateEmployeeObject(employee)

            if (validation.isValid) {
                addNewEmployee(employee)
                retrieveAndDisplayEmployees()
            } else {
                console.log('Invalid employee object.', validation.errors)
            }
        }

        const isProfilePhotoValid = readFileToDataUrl(uploadedPhoto, photoProcessedCallback)

        if (!isProfilePhotoValid) {
            photoProcessedCallback(null)
        }
    }

    const addEventListeners = () => {
        const addEmployeeButtonElem = document.querySelector('#addEmployeeButton')
        addEmployeeButtonElem.addEventListener('click', onAddEmployeeButtonClick)
    }

    addEventListeners()
    retrieveAndDisplayEmployees()
})()
