import {
    getAuth,
    signInWithEmailAndPassword,

} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"

const signInForm = document.querySelector('.signIn')
const errorMessage = document.getElementById('error_msg')

const auth = getAuth()

signInForm.addEventListener('submit', async (e) => {
    console.log('work')
    e.preventDefault()
    try {
        const email = signInForm.email.value
        const password = signInForm.password.value
        const cred = await signInWithEmailAndPassword(auth, email, password)
        signInForm.reset()
        const authToken = cred.user.uid
        sessionStorage.setItem('authToken', authToken)
        window.location.href = '../pages/index.html'
    } catch (error) {
        errorMessage.style.display = 'block'
        if (error.code === 'auth/user-not-found') {
            errorMessage.textContent = '*user not found'
        } else if (error.code === 'auth/wrong-password') {
            errorMessage.textContent = '*wrong password'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage.textContent = '*invalid email'
        } else if (error.code === 'auth/missing-password') {
            errorMessage.textContent = '*missing password'
        }
        else {
            errorMessage.textContent = error.code
        }
        signInForm.reset()
    }

})

