/* 
    Main entrypoint
*/
;(function () {
    // Filters
    let filterByString = ''
    let filterBySex = ''
    let filterByBirthdate = null
    let filterByPhoto = ''
    let sortingCriteria = ''

    // Sorting Methods
    const sortingMethods = {
        ageInc: ({ birthdate: birthdate1 }, { birthdate: birthdate2 }) => {
            if (calculateAgeFromBirthdate(birthdate1) < calculateAgeFromBirthdate(birthdate2)) {
                return -1
            }

            if (calculateAgeFromBirthdate(birthdate1) > calculateAgeFromBirthdate(birthdate2)) {
                return 1
            }

            return 0
        },
        ageDec: ({ birthdate: birthdate1 }, { birthdate: birthdate2 }) => {
            if (calculateAgeFromBirthdate(birthdate1) < calculateAgeFromBirthdate(birthdate2)) {
                return 1
            }

            if (calculateAgeFromBirthdate(birthdate1) > calculateAgeFromBirthdate(birthdate2)) {
                return -1
            }

            return 0
        },
        name: ({ firstName: firstName1, lastName: lastName1 }, { firstName: firstName2, lastName: lastName2 }) => {
            const name1 = `${firstName1} ${lastName1}`
            const name2 = `${firstName2} ${lastName2}`

            if (name1 < name2) {
                return -1
            }

            if (name1 > name2) {
                return 1
            }

            return 0
        },
    }

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

    const removeEmployeeFromArrayByIndex = (index) => {
        const employees = retrieveEmployeeArray()
        employees.splice(index, 1)
        saveEmployeeArray(employees)
    }

    // UI display methods
    const displayAddEmployeeModal = () => {
        const addEmployeeModalElem = document.querySelector('#addEmployeeModal')
        addEmployeeModalElem.style.display = 'block'
    }

    const hideAddEmployeeModal = () => {
        const addEmployeeModalElem = document.querySelector('#addEmployeeModal')
        addEmployeeModalElem.style.display = ''
    }

    const retrieveAndDisplayEmployees = () => {
        const employees = retrieveEmployeeArray()
        updateEmployeeTableUI(employees)
    }

    const updateEmployeeTableUI = (employees) => {
        const tableBodyElem = document.querySelector('#employeesTable tbody')
        tableBodyElem.innerHTML = ''

        employees = applySortsAndFilters(employees)

        employees.forEach((employee, index) => {
            tableBodyElem.appendChild(createEmployeeTableRow(employee, index))
        })
    }

    const applySortsAndFilters = (employees) => {
        if (filterByString !== '') {
            employees = employees.filter((employee) => {
                const { firstName, lastName } = employee
                const name = `${firstName} ${lastName}`
                return name.toLowerCase().includes(filterByString.toLowerCase())
            })
        }

        if (filterBySex !== '') {
            employees = employees.filter((employee) => employee.sex === filterBySex)
        }

        if (filterByBirthdate !== null) {
            employees = employees.filter((employee) => employee.birthdate === filterByBirthdate)
        }

        if (filterByPhoto !== '') {
            if (filterByPhoto == 'hasPhoto') {
                employees = employees.filter((employee) => employee.profilePhoto !== '')
            } else if (filterByPhoto == 'noPhoto') {
                employees = employees.filter((employee) => employee.profilePhoto === '')
            }
        }

        if (sortingCriteria !== '') {
            employees = employees.sort(sortingMethods[sortingCriteria])
        }

        return employees
    }

    const createEmployeeTableRow = (employee, index) => {
        const { firstName, lastName, email, sex, birthdate, profilePhoto } = employee
        const row = document.createElement('tr')
        row.setAttribute('data-employee-index', index)

        const photoTd = document.createElement('td')
        const imageElem = document.createElement('img')
        imageElem.src = profilePhoto
        photoTd.appendChild(imageElem)

        const nameTd = document.createElement('td')
        nameTd.textContent = `${firstName} ${lastName}`

        const emailTd = document.createElement('td')
        emailTd.textContent = email

        const sexTd = document.createElement('td')
        sexTd.textContent = getSexAsPrintableString(sex)

        const birthdateTd = document.createElement('td')
        const mBirthdate = moment(birthdate)
        birthdateTd.textContent = mBirthdate.format('D MMMM YYYY')

        const actionsTd = document.createElement('td')
        const removeButton = document.createElement('button')
        removeButton.setAttribute('data-remove', true)
        removeButton.textContent = 'X'
        actionsTd.appendChild(removeButton)

        row.append(photoTd, nameTd, emailTd, sexTd, birthdateTd, actionsTd)
        return row
    }

    const displayErrors = (errors) => {
        const errorListSection = document.querySelector('#errorListSection')

        if (errors.length === 0) {
            errorListSection.style = 'display: none'
            return
        }

        errorListSection.style = ''

        const errorListUl = document.querySelector('#errorListSection ul')
        errorListUl.innerHTML = ''

        errors.forEach((error) => {
            const errorLi = document.createElement('li')
            errorLi.textContent = error
            errorListUl.appendChild(errorLi)
        })
    }

    const hideErrorSection = () => {
        displayErrors([])
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

    // Helpers
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date)
    }

    const calculateAgeFromBirthdate = (birthdate) => {
        birthdate = new Date(birthdate)
        const ageDiff = Date.now() - birthdate.getTime()
        const ageDate = new Date(ageDiff)
        return Math.abs(ageDate.getUTCFullYear() - 1970)
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

    const getSexAsPrintableString = (sex) => {
        if (sex === 'male') {
            return 'Male'
        }

        if (sex === 'female') {
            return 'Female'
        }

        if (sex === 'unspecified') {
            return 'Other / Preferred not to say'
        }
    }

    // Event Handlers
    const onAddEmployeeButtonClick = () => {
        hideErrorSection()

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
                hideAddEmployeeModal()
                retrieveAndDisplayEmployees()
            } else {
                displayErrors(validation.errors)
            }
        }

        const isProfilePhotoValid = readFileToDataUrl(uploadedPhoto, photoProcessedCallback)

        if (!isProfilePhotoValid) {
            photoProcessedCallback('')
        }
    }

    const onDisplayAddEmployeeModalButtonClick = () => {
        displayAddEmployeeModal()
    }

    const onRemoveEmployeeButtonClick = (event) => {
        const { target: button } = event

        if (button.tagName == 'BUTTON' && button.getAttribute('data-remove') == 'true') {
            const parentTd = button.parentElement
            const parentTr = parentTd.parentElement
            const index = parentTr.getAttribute('data-employee-index')

            removeEmployeeFromArrayByIndex(index)
            retrieveAndDisplayEmployees()
        }
    }

    const onFilterFieldInputChange = (event) => {
        filterByString = event.target.value
        retrieveAndDisplayEmployees()
    }

    const onFilterBySexFieldInputChange = (event) => {
        filterBySex = event.target.value
        retrieveAndDisplayEmployees()
    }

    const onFilterByBirthdateFieldInputChange = (event) => {
        const {
            target: { value: dateString },
        } = event

        if (dateString === '') {
            filterByBirthdate = null
        } else {
            filterByBirthdate = new Date(event.target.value).toISOString()
        }

        retrieveAndDisplayEmployees()
    }

    const onFilterByPhotoFieldInputChange = (event) => {
        filterByPhoto = event.target.value
        retrieveAndDisplayEmployees()
    }

    const onSortSelectInputChange = (event) => {
        sortingCriteria = event.target.value
        retrieveAndDisplayEmployees()
    }

    const onCloseAddEmployeeModalButtonClick = (event) => {
        hideAddEmployeeModal()
    }

    const onWindowClickCloseModal = (event) => {
        const modalElem = document.querySelector('#addEmployeeModal')

        if (event.target == modalElem) {
            hideAddEmployeeModal()
        }
    }

    const addEventListeners = () => {
        const addEmployeeButtonElem = document.querySelector('#addEmployeeButton')
        addEmployeeButtonElem.addEventListener('click', onAddEmployeeButtonClick)

        const toggleNewEmployeeModalElem = document.querySelector('#toggleNewEmployeeModal')
        toggleNewEmployeeModalElem.addEventListener('click', onDisplayAddEmployeeModalButtonClick)

        const employeesTable = document.querySelector('#employeesTable')
        employeesTable.addEventListener('click', onRemoveEmployeeButtonClick)

        const searchBarElem = document.querySelector('#searchBar')
        searchBarElem.addEventListener('input', onFilterFieldInputChange)

        const filterBySexElem = document.querySelector('#filterBySex')
        filterBySexElem.addEventListener('input', onFilterBySexFieldInputChange)

        const filterByBirthdateElem = document.querySelector('#filterByBirthdate')
        filterByBirthdateElem.addEventListener('input', onFilterByBirthdateFieldInputChange)

        const filterByPhotoElem = document.querySelector('#filterByPhoto')
        filterByPhotoElem.addEventListener('input', onFilterByPhotoFieldInputChange)

        const sortSelectElem = document.querySelector('#sortBy')
        sortSelectElem.addEventListener('input', onSortSelectInputChange)

        const closeAddEmployeeModalButtonElem = document.querySelector('#closeAddEmployeeModal')
        closeAddEmployeeModalButtonElem.addEventListener('click', onCloseAddEmployeeModalButtonClick)

        window.addEventListener('click', onWindowClickCloseModal)
    }

    addEventListeners()
    retrieveAndDisplayEmployees()
})()
