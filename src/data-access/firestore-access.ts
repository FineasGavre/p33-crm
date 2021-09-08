import { app } from '../utils/firebase'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    Firestore,
    getFirestore,
    orderBy,
    query,
    QueryConstraint,
    where,
    onSnapshot,
    Unsubscribe,
} from '@firebase/firestore'
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

    private currentModifiers?: FilterAndSortCriteria = null
    private currentUnsubscribe?: Unsubscribe = null
    private currentUpdateFn?: (employees: Employee[]) => void = null

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
                    queryConstraints.push(where('profilePhoto', '!=', 'placeholder'))
                } else {
                    queryConstraints.push(where('profilePhoto', '==', 'placeholder'))
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

    listenToAllEmployees(onUpdate: (employees: Employee[]) => void, modifiers?: FilterAndSortCriteria) {
        this.currentModifiers = modifiers
        this.currentUpdateFn = onUpdate

        this.setupFirestoreUpdates()
    }

    private setupFirestoreUpdates() {
        const queryConstraints: QueryConstraint[] = []

        if (this.currentModifiers !== null) {
            queryConstraints.push(...this.generateQueryConstraints(this.currentModifiers))
        }

        const q = query(collection(this.db, 'employees'), ...queryConstraints)
        this.currentUnsubscribe = onSnapshot(q, (snapshot) => {
            this.currentUpdateFn(snapshot.docs.map((e) => employeeConverter.fromFirestore(e)))
        })
    }

    changeCurrentConstraints(modifiers?: FilterAndSortCriteria) {
        this.currentUnsubscribe()
        this.currentModifiers = modifiers

        this.setupFirestoreUpdates()
    }

    async addEmployee(employee: Employee) {
        await addDoc(collection(this.db, 'employees'), employee)
    }

    async deleteEmployeeWithId(id: string) {
        await deleteDoc(doc(this.db, 'employees', id))
    }
}
