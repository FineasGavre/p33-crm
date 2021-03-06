import moment from 'moment'
import { Employee } from '../data-access/employee.interface'
import { FilterAndSortCriteria, FirestoreAccess } from '../data-access/firestore-access'
import { addEventListenerToElement, getSexAsPrintableString } from '../utils/utils'

const placeholderPhotoSrc = './assets/images/placeholder-profile-photo.png'
const firestoreAccess = new FirestoreAccess()

let sortingCriteria: FilterAndSortCriteria = {
    filter: {},
}

function syncEmployeesToUI(employees: Employee[]) {
    const tableBodyElem = document.querySelector('#employeesTable tbody')
    tableBodyElem.innerHTML = ''

    employees.forEach((employee) => {
        tableBodyElem.appendChild(createEmployeeTableRow(employee))
    })
}

function createEmployeeTableRow(employee: Employee) {
    const { id, firstName, lastName, email, sex, birthdate, profilePhoto } = employee
    const row = document.createElement('tr')
    row.setAttribute('data-employee-id', id)

    const photoTd = document.createElement('td')
    const imageElem = document.createElement('img')

    if (profilePhoto === 'placeholder') {
        imageElem.src = placeholderPhotoSrc
    } else {
        imageElem.src = profilePhoto
    }

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

async function onRemoveEmployeeButtonClick(event: Event) {
    const { target: targetElement } = event
    const button = targetElement as HTMLButtonElement

    if (button.tagName == 'BUTTON' && button.getAttribute('data-remove') == 'true') {
        const parentTd = button.parentElement
        const parentTr = parentTd.parentElement
        const employeeId = parentTr.getAttribute('data-employee-id')

        await firestoreAccess.deleteEmployeeWithId(employeeId)
    }
}

function onFilterFieldInputChange(event: Event) {
    const inputElem = event.target as HTMLInputElement
    sortingCriteria.filter.name = inputElem.value

    updateModifiersInFirestore()
}

function onFilterBySexFieldInputChange(event: Event) {
    const inputElem = event.target as HTMLInputElement

    if (inputElem.value == '') {
        sortingCriteria.filter.sex = undefined
    } else {
        sortingCriteria.filter.sex = inputElem.value as 'male' | 'female' | 'other'
    }

    updateModifiersInFirestore()
}

function onFilterByBirthdateStartFieldInputChange(event: Event) {
    const { target: targetElem } = event
    const inputTarget = targetElem as HTMLInputElement

    const dateString = inputTarget.value

    if (dateString === '') {
        sortingCriteria.filter.birthdate = {
            ...sortingCriteria.filter.birthdate,
            start: undefined,
        }
    } else {
        sortingCriteria.filter.birthdate = {
            ...sortingCriteria.filter.birthdate,
            start: new Date(dateString),
        }
    }

    updateModifiersInFirestore()
}

function onFilterByBirthdateEndFieldInputChange(event: Event) {
    const { target: targetElem } = event
    const inputTarget = targetElem as HTMLInputElement

    const dateString = inputTarget.value

    if (dateString === '') {
        sortingCriteria.filter.birthdate = {
            ...sortingCriteria.filter.birthdate,
            end: undefined,
        }
    } else {
        sortingCriteria.filter.birthdate = {
            ...sortingCriteria.filter.birthdate,
            end: new Date(dateString),
        }
    }

    updateModifiersInFirestore()
}

function onFilterByPhotoFieldInputChange(event: Event) {
    const inputElem = event.target as HTMLInputElement
    const filterByPhotoValue = inputElem.value

    if (filterByPhotoValue == '') {
        sortingCriteria.filter.photo = undefined
    } else if (filterByPhotoValue == 'withPhoto') {
        sortingCriteria.filter.photo = true
    } else {
        sortingCriteria.filter.photo = false
    }

    updateModifiersInFirestore()
}

function onSortSelectInputChange(event: Event) {
    const inputElem = event.target as HTMLInputElement

    if (inputElem.value == '') {
        sortingCriteria.sort = undefined
    } else {
        sortingCriteria.sort = inputElem.value as 'ageInc' | 'ageDec' | 'name'
    }

    updateModifiersInFirestore()
}

function addEventListeners() {
    addEventListenerToElement('input', '#searchBar', onFilterFieldInputChange)
    addEventListenerToElement('input', '#filterBySex', onFilterBySexFieldInputChange)
    addEventListenerToElement('input', '#filterByBirthdateStart', onFilterByBirthdateStartFieldInputChange)
    addEventListenerToElement('input', '#filterByBirthdateEnd', onFilterByBirthdateEndFieldInputChange)
    addEventListenerToElement('input', '#filterByPhoto', onFilterByPhotoFieldInputChange)
    addEventListenerToElement('input', '#sortBy', onSortSelectInputChange)
    addEventListenerToElement('click', '#employeesTable', onRemoveEmployeeButtonClick)
}

function updateModifiersInFirestore() {
    firestoreAccess.changeCurrentConstraints(sortingCriteria)
}

function retrieveAndSyncEmployees() {
    firestoreAccess.listenToAllEmployees((employees) => {
        syncEmployeesToUI(employees)
    }, sortingCriteria)
}

export function setupEmployeeTable() {
    addEventListeners()
    retrieveAndSyncEmployees()
}
