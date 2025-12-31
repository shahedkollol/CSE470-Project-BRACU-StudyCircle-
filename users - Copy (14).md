# BRACU CSE Test Accounts

Use these BRAC University CSE-themed accounts for manual testing. They are already registered in the backend. Passwords are student-friendly but non-trivial. No tokens are stored here.

## Admin (Dept Coordinator)

- Name: CSE Coordinator
- Email: coordinator@bracu.ac.bd
- Password: CSEadmin!23
- Role: admin
- Department: CSE
- Batch: 2018
- ID: 69556b1b554a4dbce02e30c7

## Faculty Mentor

- Name: Dr. Farzana Rahman
- Email: farzana.rahman@bracu.ac.bd
- Password: Mentor@CSE
- Role: faculty
- Department: CSE
- Batch: 2008
- ID: 69556b1b554a4dbce02e30ca

## Senior Student

- Name: Taufiq Hasan
- Email: taufiq.hasan@bracu.ac.bd
- Password: Study@52
- Role: student
- Department: CSE
- Batch: 52
- ID: 69556b1b554a4dbce02e30cd

## Alumni (Industry)

- Name: Shorna Mahmud
- Email: shorna.mahmud@alumni.bracu.ac.bd
- Password: Alumni@CSE
- Role: alumni
- Department: CSE
- Batch: 2020
- ID: 69556b1c554a4dbce02e30d0

### Auth Headers (current backend behavior)

The backend accepts `x-user-id` and `x-user-role` headers instead of Bearer JWT verification. Use the IDs above:

- `x-user-id: <ID>`
- `x-user-role: <role>`

If JWT verification is later enabled, switch to the usual `Authorization: Bearer <token>` flow.
