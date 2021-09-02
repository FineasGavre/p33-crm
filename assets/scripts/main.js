/* 
    Main entrypoint
*/
;(function () {})()

/*
    Data Access functions
*/
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
