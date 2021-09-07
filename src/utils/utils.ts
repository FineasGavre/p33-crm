export function isValidDate(date: Date) {
    // @ts-ignore
    return date instanceof Date && !isNaN(date)
}

export function calculateAgeFromBirthdate(birthdate: string | Date) {
    birthdate = new Date(birthdate)
    const ageDiff = Date.now() - birthdate.getTime()
    const ageDate = new Date(ageDiff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export function readFileToDataUrl(file: File, callback: (dataUri: string | ArrayBuffer) => void) {
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

export function getSexAsPrintableString(sex: string) {
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

export function addEventListenerToElement(eventType: string, elementSelector: string, eventHandler: (event?: Event) => void) {
    document.querySelector(elementSelector).addEventListener(eventType, eventHandler)
}
