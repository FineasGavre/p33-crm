import { app } from '../utils/firebase'
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, orderBy, query, QueryConstraint, where } from '@firebase/firestore'
import { Employee } from './employee.interface'
import { employeeConverter } from './employee.converter'

export type FilterAndSortCriteria = {
    filter?: {
        name?: string
        sex?: 'male' | 'female' | 'other'
        birthdate?: {
            start: Date
            end: Date
        }
        photo?: boolean
    }
    sort?: 'ageInc' | 'ageDec' | 'name'
}

export class FirestoreAccess {
    private db: Firestore

    constructor() {
        this.db = getFirestore(app)
    }

    private generateQueryConstraints(modifiers: FilterAndSortCriteria): QueryConstraint[] {
        const queryConstraints: QueryConstraint[] = []

        if (modifiers.filter !== undefined) {
            if (modifiers.filter.name !== undefined) {
                queryConstraints.push(where('firstName', '>=', modifiers.filter.name))
                queryConstraints.push(where('firstName', '<=', modifiers.filter.name + '~'))
            }

            if (modifiers.filter.sex !== undefined) {
                queryConstraints.push(where('sex', '==', modifiers.filter.sex))
            }

            if (modifiers.filter.photo !== undefined) {
                if (modifiers.filter.photo) {
                    queryConstraints.push(where('profilePhoto', '!=', ''))
                } else {
                    queryConstraints.push(where('profilePhoto', '==', ''))
                }
            }

            if (modifiers.filter.birthdate !== undefined && modifiers.filter.birthdate.start !== undefined && modifiers.filter.birthdate.end !== undefined) {
                queryConstraints.push(where('birthdate', '>=', modifiers.filter.birthdate.start))
                queryConstraints.push(where('birthdate', '<=', modifiers.filter.birthdate.end))
            }
        }

        if (modifiers.sort !== undefined) {
            switch (modifiers.sort) {
                case 'ageDec':
                    queryConstraints.push(orderBy('birthdate', 'desc'))
                    break
                case 'ageInc':
                    queryConstraints.push(orderBy('birthdate', 'asc'))
                    break
                case 'name':
                    queryConstraints.push(orderBy('firstName'))
                    queryConstraints.push(orderBy('lastName'))
                    break
            }
        }

        return queryConstraints
    }

    async getAllEmployees(modifiers?: FilterAndSortCriteria): Promise<Employee[]> {
        console.log(modifiers)
        const queryConstraints: QueryConstraint[] = []

        if (modifiers !== undefined) {
            queryConstraints.push(...this.generateQueryConstraints(modifiers))
        }

        const q = query(collection(this.db, 'employees'), ...queryConstraints)

        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map((e) => employeeConverter.fromFirestore(e))
    }

    async addEmployee(employee: Employee) {
        await addDoc(collection(this.db, 'employees'), employee)
    }

    async deleteEmployeeWithId(id: string) {
        await deleteDoc(doc(this.db, 'employees', id))
    }
}
