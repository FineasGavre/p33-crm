import { addDoc, collection, Firestore, getDocs, getFirestore } from '@firebase/firestore'
import { Employee } from './employee.interface'

export class FirestoreAccess {
    private db: Firestore

    constructor() {
        this.db = getFirestore()
    }

    async getAllEmployees(): Promise<Employee[]> {
        const querySnapshot = await getDocs(collection(this.db, 'employees'))
        // TODO: create mapper
        // @ts-ignore
        return querySnapshot.docs.map((doc) => doc.data())
    }

    async addEmployee(employee: Employee) {
        await addDoc(collection(this.db, 'employees'), employee)
    }
}
