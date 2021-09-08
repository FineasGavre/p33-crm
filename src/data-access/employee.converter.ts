import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from '@firebase/firestore'
import { Employee } from './employee.interface'

export const employeeConverter: FirestoreDataConverter<Employee> = {
    toFirestore: function (employee: Employee): DocumentData {
        return employee
    },
    fromFirestore: function (snapshot: QueryDocumentSnapshot<DocumentData>, options?: SnapshotOptions): Employee {
        const data = snapshot.data(options)

        return {
            id: snapshot.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            sex: data.sex,
            birthdate: data.birthdate.toDate(),
            profilePhoto: data.profilePhoto,
        }
    },
}
