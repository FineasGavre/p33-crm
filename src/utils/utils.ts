export function isValidDate(date: Date) {
    return date instanceof Date
}

export function calculateAgeFromBirthdate(birthdate: string | Date) {
    birthdate = new Date(birthdate)
    const ageDiff = Date.now() - birthdate.getTime()
    const ageDate = new Date(ageDiff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export async function readFileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.addEventListener('load', (event) => {
            resolve(event.target.result as string)
        })

        try {
            reader.readAsDataURL(file)
        } catch (err) {
            reject(err)
        }
    })
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
