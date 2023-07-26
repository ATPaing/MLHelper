import {
    getAuth,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'

const logoutButton = document.getElementById('logOut')
const auth = getAuth()
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            sessionStorage.removeItem("authToken");
        })
        .catch((error) => {
            console.log(error)
        })
})