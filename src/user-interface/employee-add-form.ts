import { Employee } from '../data-access/employee.interface'
import { FirestoreAccess } from '../data-access/firestore-access'
import { addEventListenerToElement, readFileToDataUrl } from '../utils/utils'
import { EmployeeValidator, ValidationResult } from '../validation/employee-validator'
import { retrieveAndSyncEmployees } from './employee-table'

const employeeValidator = new EmployeeValidator()
const firestoreAccess = new FirestoreAccess()

let employeeModel: Employee = {
    firstName: '',
    lastName: '',
    email: '',
    sex: '',
    birthdate: null,
    profilePhoto: '',
}

let currentValidationResult: ValidationResult = EmployeeValidator.PASSING_VALIDATION

let isModalOpen = false

async function updateModelFromUI() {
    const { value: firstName } = document.querySelector('#firstName') as HTMLInputElement
    const { value: lastName } = document.querySelector('#lastName') as HTMLInputElement
    const { value: email } = document.querySelector('#email') as HTMLInputElement
    const { value: sex } = document.querySelector('#sex') as HTMLInputElement
    const { value: birthdateString } = document.querySelector('#birthdate') as HTMLInputElement
    const {
        files: [uploadedPhoto],
    } = document.querySelector('#picture') as HTMLInputElement

    const birthdate = new Date(birthdateString)

    let profilePhoto = ''

    try {
        profilePhoto = await readFileToDataUrl(uploadedPhoto)
    } catch (e) {
        profilePhoto = ''
    }

    employeeModel = {
        ...employeeModel,
        firstName,
        lastName,
        email,
        sex,
        birthdate,
        profilePhoto,
    }
}

function clearEmployeeModel() {
    // TODO: reflect this change in the UI
    employeeModel = {
        firstName: '',
        lastName: '',
        email: '',
        sex: '',
        birthdate: null,
        profilePhoto: '',
    }
}

function validateEmployee() {
    currentValidationResult = employeeValidator.validateEmployeeObject(employeeModel)
    syncValidationState()
}

function syncValidationState() {
    const { errors } = currentValidationResult
    const errorListSectionElem = document.querySelector('#errorListSection') as HTMLDivElement

    if (errors.length === 0) {
        errorListSectionElem.style.display = 'none'
        return
    }

    errorListSectionElem.style.display = 'block'

    const errorListUl = document.querySelector('#errorListSection ul')
    errorListUl.innerHTML = ''

    errors.forEach((error) => {
        const errorLi = document.createElement('li')
        errorLi.textContent = error
        errorListUl.appendChild(errorLi)
    })
}

function clearValidationState() {
    currentValidationResult = EmployeeValidator.PASSING_VALIDATION
    syncValidationState()
}

function syncModalState() {
    const addEmployeeModalElem = document.querySelector('#addEmployeeModal') as HTMLDivElement

    if (isModalOpen) {
        addEmployeeModalElem.style.display = 'block'
    } else {
        addEmployeeModalElem.style.display = 'none'
    }
}

function openModal() {
    isModalOpen = true
    syncModalState()
}

function closeModal() {
    isModalOpen = false
    syncModalState()
}

/*
    Event Handlers
*/
async function onAddEmployeeButtonClick() {
    clearValidationState()
    await updateModelFromUI()
    validateEmployee()

    if (currentValidationResult.isValid) {
        await firestoreAccess.addEmployee(employeeModel)
        closeModal()

        retrieveAndSyncEmployees()
    }
}

function onWindowClickCloseModal(event: Event) {
    const modalElem = document.querySelector('#addEmployeeModal')

    if (event.target == modalElem) {
        closeModal()
    }
}

function addEventListeners() {
    addEventListenerToElement('click', '#addEmployeeButton', onAddEmployeeButtonClick)
    addEventListenerToElement('click', '#toggleNewEmployeeModal', openModal)
    addEventListenerToElement('click', '#closeAddEmployeeModal', closeModal)
    window.addEventListener('click', onWindowClickCloseModal)
}

export function setupEmployeeAddForm() {
    addEventListeners()
}
