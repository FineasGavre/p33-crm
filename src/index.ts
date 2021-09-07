import Main from './main'
import { initializeApp } from 'firebase/app'
import { getFirestore, addDoc, collection } from 'firebase/firestore'

/*
    Configure FirebaseApp
*/
const configureFirebase = () => {
    const firebaseConfig = {
        apiKey: 'AIzaSyBHCbfiGbYeiVJg_tHJjQojlBFagId1kII',
        authDomain: 'p33-crm.firebaseapp.com',
        projectId: 'p33-crm',
        storageBucket: 'p33-crm.appspot.com',
        messagingSenderId: '760292394938',
        appId: '1:760292394938:web:0594f86c9c7dede7a43f83',
    }

    const app = initializeApp(firebaseConfig)
}

configureFirebase()
Main()
