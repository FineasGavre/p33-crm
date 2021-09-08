import { initializeApp } from '@firebase/app'

const firebaseConfig = {
    apiKey: 'AIzaSyBHCbfiGbYeiVJg_tHJjQojlBFagId1kII',
    authDomain: 'p33-crm.firebaseapp.com',
    projectId: 'p33-crm',
    storageBucket: 'p33-crm.appspot.com',
    messagingSenderId: '760292394938',
    appId: '1:760292394938:web:0594f86c9c7dede7a43f83',
}

export const app = initializeApp(firebaseConfig)
