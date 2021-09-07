import moment from 'moment'
import { Employee } from './data-access/employee.interface'
import { FirestoreAccess } from './data-access/firestore-access'

type SortingMethods = { [key: string]: (arg0: Employee, arg1: Employee) => -1 | 0 | 1 }
type PrintedErrors = { isValid: boolean; errors: string[] }

export default function Main() {
    const firestoreAccess = new FirestoreAccess()

    // Filters
    let filterByString = ''
    let filterBySex = ''
    let filterByBirthdateStart: string | null = null
    let filterByBirthdateEnd: string | null = null
    let filterByPhoto = ''
    let sortingCriteria = ''

    // Sorting Methods
    const sortingMethods: SortingMethods = {
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
    const retrieveEmployeeArray = async (): Promise<Employee[]> => {
        const storedData = localStorage.getItem('employees')

        if (storedData === null) {
            return []
        } else {
            return JSON.parse(storedData)
        }
    }

    const saveEmployeeArray = (employees: Employee[]) => {
        localStorage.setItem('employees', JSON.stringify(employees))
    }

    const addNewEmployee = async (employee: Employee) => {
        await firestoreAccess.addEmployee(employee)
    }

    const removeEmployeeFromArrayByIndex = async (index: number) => {
        const employees = await retrieveEmployeeArray()
        employees.splice(index, 1)
        saveEmployeeArray(employees)
    }

    // UI display methods
    const displayAddEmployeeModal = () => {
        const addEmployeeModalElem = document.querySelector('#addEmployeeModal') as HTMLDivElement
        addEmployeeModalElem.style.display = 'block'
    }

    const hideAddEmployeeModal = () => {
        const addEmployeeModalElem = document.querySelector('#addEmployeeModal') as HTMLDivElement
        addEmployeeModalElem.style.display = ''
    }

    const retrieveAndDisplayEmployees = async () => {
        const employees = await firestoreAccess.getAllEmployees()
        updateEmployeeTableUI(employees)
    }

    const updateEmployeeTableUI = (employees: Employee[]) => {
        const tableBodyElem = document.querySelector('#employeesTable tbody')
        tableBodyElem.innerHTML = ''

        employees = applySortsAndFilters(employees)

        employees.forEach((employee, index) => {
            tableBodyElem.appendChild(createEmployeeTableRow(employee, index))
        })
    }

    const applySortsAndFilters = (employees: Employee[]) => {
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

        if (filterByBirthdateStart !== null && filterByBirthdateEnd !== null) {
            employees = employees.filter((employee) => {
                const birthdateEmployee = moment(employee.birthdate)
                const birthdate1 = moment(filterByBirthdateStart)
                const birthdate2 = moment(filterByBirthdateEnd)

                return birthdateEmployee.isBetween(birthdate1, birthdate2)
            })
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

    const createEmployeeTableRow = (employee: Employee, index: number) => {
        const { firstName, lastName, email, sex, birthdate, profilePhoto } = employee
        const row = document.createElement('tr')
        row.setAttribute('data-employee-index', index.toString())

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
        const iconElem = document.createElement('i')
        removeButton.setAttribute('data-remove', 'true')
        removeButton.className = 'red'
        iconElem.className = 'fa fa-times'

        removeButton.appendChild(iconElem)
        actionsTd.appendChild(removeButton)

        row.append(photoTd, nameTd, emailTd, sexTd, birthdateTd, actionsTd)
        return row
    }

    const displayErrors = (errors: string[]) => {
        const errorListSection = document.querySelector('#errorListSection') as HTMLDivElement

        if (errors.length === 0) {
            errorListSection.style.display = 'none'
            return
        }

        errorListSection.style.display = 'block'

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
    const validateEmployeeObject = (employee: Employee) => {
        const { firstName, lastName, email, sex, birthdate, profilePhoto } = employee
        const validationResponse: PrintedErrors = {
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
    const isValidDate = (date: Date) => {
        // @ts-ignore
        return date instanceof Date && !isNaN(date)
    }

    const calculateAgeFromBirthdate = (birthdate: string | Date) => {
        birthdate = new Date(birthdate)
        const ageDiff = Date.now() - birthdate.getTime()
        const ageDate = new Date(ageDiff)
        return Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    const readFileToDataUrl = (file: File, callback: (arg0: string | ArrayBuffer) => void) => {
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

    const getSexAsPrintableString = (sex: string) => {
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

        const { value: firstName } = document.querySelector('#firstName') as HTMLInputElement
        const { value: lastName } = document.querySelector('#lastName') as HTMLInputElement
        const { value: email } = document.querySelector('#email') as HTMLInputElement
        const { value: sex } = document.querySelector('#sex') as HTMLInputElement
        const { value: birthdateString } = document.querySelector('#birthdate') as HTMLInputElement
        const {
            files: [uploadedPhoto],
        } = document.querySelector('#picture') as HTMLInputElement

        const birthdate = new Date(birthdateString)

        const photoProcessedCallback = (profilePhoto: string) => {
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

    const onRemoveEmployeeButtonClick = (event: Event) => {
        const { target: targetElement } = event
        const button = targetElement as HTMLButtonElement

        if (button.tagName == 'BUTTON' && button.getAttribute('data-remove') == 'true') {
            const parentTd = button.parentElement
            const parentTr = parentTd.parentElement
            const index = parentTr.getAttribute('data-employee-index')

            removeEmployeeFromArrayByIndex(parseInt(index))
            retrieveAndDisplayEmployees()
        }
    }

    const onFilterFieldInputChange = (event: Event) => {
        const inputElem = event.target as HTMLInputElement
        filterByString = inputElem.value

        retrieveAndDisplayEmployees()
    }

    const onFilterBySexFieldInputChange = (event: Event) => {
        const inputElem = event.target as HTMLInputElement
        filterBySex = inputElem.value

        retrieveAndDisplayEmployees()
    }

    const onFilterByBirthdateStartFieldInputChange = (event: Event) => {
        const { target: targetElem } = event
        const inputTarget = targetElem as HTMLInputElement

        const dateString = inputTarget.value

        if (dateString === '') {
            filterByBirthdateStart = null
        } else {
            filterByBirthdateStart = new Date(dateString).toISOString()
        }

        retrieveAndDisplayEmployees()
    }

    const onFilterByBirthdateEndFieldInputChange = (event: Event) => {
        const { target: targetElem } = event
        const inputTarget = targetElem as HTMLInputElement

        const dateString = inputTarget.value

        if (dateString === '') {
            filterByBirthdateEnd = null
        } else {
            filterByBirthdateEnd = new Date(dateString).toISOString()
        }

        retrieveAndDisplayEmployees()
    }

    const onFilterByPhotoFieldInputChange = (event: Event) => {
        const inputElem = event.target as HTMLInputElement
        filterByPhoto = inputElem.value

        retrieveAndDisplayEmployees()
    }

    const onSortSelectInputChange = (event: Event) => {
        const inputElem = event.target as HTMLInputElement
        sortingCriteria = inputElem.value

        retrieveAndDisplayEmployees()
    }

    const onCloseAddEmployeeModalButtonClick = () => {
        hideAddEmployeeModal()
    }

    const onWindowClickCloseModal = (event: Event) => {
        const modalElem = document.querySelector('#addEmployeeModal')

        if (event.target == modalElem) {
            hideAddEmployeeModal()
        }
    }

    const addEventListenerToElement = (eventType: string, elementSelector: string, eventHandler: (event?: Event) => void) => {
        document.querySelector(elementSelector).addEventListener(eventType, eventHandler)
    }

    const addEventListeners = () => {
        addEventListenerToElement('click', '#addEmployeeButton', onAddEmployeeButtonClick)
        addEventListenerToElement('click', '#toggleNewEmployeeModal', onDisplayAddEmployeeModalButtonClick)
        addEventListenerToElement('click', '#employeesTable', onRemoveEmployeeButtonClick)
        addEventListenerToElement('input', '#searchBar', onFilterFieldInputChange)
        addEventListenerToElement('input', '#filterBySex', onFilterBySexFieldInputChange)
        addEventListenerToElement('input', '#filterByBirthdateStart', onFilterByBirthdateStartFieldInputChange)
        addEventListenerToElement('input', '#filterByBirthdateEnd', onFilterByBirthdateEndFieldInputChange)
        addEventListenerToElement('input', '#filterByPhoto', onFilterByPhotoFieldInputChange)
        addEventListenerToElement('input', '#sortBy', onSortSelectInputChange)
        addEventListenerToElement('click', '#closeAddEmployeeModal', onCloseAddEmployeeModalButtonClick)

        window.addEventListener('click', onWindowClickCloseModal)
    }

    addEventListeners()
    retrieveAndDisplayEmployees()
}
