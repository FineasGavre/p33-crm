# Employee CRM

[View on Vercel](https://p33-crm.vercel.app)

Build during the Principal33 Internship - Frontend Workshop led by the wonderful Marian.

# Task List

Veti construi un CMS (content management system) pentru angajati. Mai pe intelesul tuturor, un tabel cu angajati.
Inca nu legam tabelul la un backend, momentan ne focusam pe input si output local. Taskul urmator se va focusa pe integrare cu backend.

Informatiile care se cer despre angajati:

-   Nume
-   Prenume
-   Email
-   Sex
-   Data nasterii
-   BONUS: poza

Userul trebuie sa poata face input la toate datele astea intr-o pagina web. Informatiile vor fi afisate intr-un tabel, in aceeasi pagina.

## Mentiuni:

Ne intereseaza functionalitatea, nu designul

Git repository nou, stiti deja cum sta treaba cu commit-uri clar definite, cu mesaje clare

Pentru Sex, userul va putea alege dintr-un dropdown

Pentru data nasterii, userul va putea alege dintr-un date picker (BONUS userul nu poate sa aiba mai putin de 16 ani)

Toate fieldurile sunt obligatorii, daca userul nu completeaza unul din ele, primeste eroare

Angajatii pot fi stersi din tabel cu un buton X in partea dreapta

BONUS: validare pe email cu regex  
BONUS: data nasterii va fi afisata in formatul urmator: 23.04.2021 va fi afisat ca “23 Aprilie 2021” (puteti face de mana, sau cu moment.js)  
BONUS: poza angajatului va fi afisata in stanga numelui, intr-o componenta rotunda (ca poza de profil de la instagram/facebook/teams)  
BONUS: angajatii pot sa fie sortati alfabetic, dupa nume  
BONUS: angajatii pot sa fie sortati dupa data nasterii  
BONUS: angajatii pot sa fie filtrati dupa sex / data nasterii / daca au poza sau nu  
BONUS: search bar pentru cautarea angajatilor - rezultatele vor fi afisate in tabel (practic filtrare dupa string)  
BONUS: persistenta cu JSON local sau local storage  
BONUS: make it look good  
BONUS: input de date cu un modal
