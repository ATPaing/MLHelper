import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

import {
    getAuth,
    createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js"

const imageUploader = document.getElementById('imgUploader')
const profileDisplay = document.getElementById('show_profile')
const registerForm = document.getElementById('register_form')
const errorMsg = document.getElementById('error_msg')
const prompt = document.getElementById('prompt')

// inint firebase services
const db = getFirestore()
const auth = getAuth()
const storage = getStorage()

// firestore collection ref
const colRef = collection(db, 'users')

let file, waitInterval, imgLink

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = registerForm.email.value
    const password = registerForm.password.value
    const cpassword = registerForm.cpassword.value
    file = imageUploader.files.length ? imageUploader.files : null
    if (password !== cpassword) {
        errorMsg.style.display = 'block'
    } else if (password === cpassword) {
        try {
            console.log(imageUploader.files)
            file = imageUploader.files.length ? imageUploader.files : null
            console.log(file)
            prompt.classList.add('prompt-registered')
            // add animation to model
            let dots = ''
            waitInterval = setInterval(() => {
                dots += '.'
                if (dots.length > 3) {
                    dots = '.'
                }
                prompt.textContent = `Please wait${dots}`
            }, 500)
            
            // create account
            const cred = await createUserWithEmailAndPassword(auth, email, password)
            if (file) {

                // storage ref
                const profileImgRef = await ref(storage,`user-img/${file[0].name}`)
                // upload to firebase storage
                await uploadBytes(profileImgRef, file[0])
                // get download url of that image
                imgLink = await getDownloadURL(profileImgRef)
            } else if (!file) {
                imgLink = ['../src/images/avatar_male.svg']
            }


            // alert user the process
            clearInterval(waitInterval)
            prompt.textContent = `Successfully registered`
            
            setTimeout(() => {
                setInterval(() => {
                    dots += '.'
                    if (dots.length > 3) {
                        dots = '.'
                    }
                    prompt.textContent = `Redirecting to sign in page${dots}`
                }, 500)
                // store name and uid to fire store
                addDoc(colRef, {
                    name: registerForm.name.value,
                    uid: cred.user.uid,
                    profile_img_link: imgLink
                })
                .then(() => {
                    window.location.href = '../pages/signin.html'
                })
            },500)

        } catch (error) {
            clearInterval(waitInterval)
            prompt.classList.remove('prompt-registered')
            prompt.textContent = ``
            errorMsg.style.display = 'block'
            if (error.code === 'auth/weak-password') {
                errorMsg.textContent = '*weak password(need at least 6 characters)'
            } else if (error.code === 'auth/email-already-in-use') {
                errorMsg.textContent = '*email already in use'
            } else {
                console.log(error)
            }
            registerForm.reset()
        }

    }
    
})

imageUploader.addEventListener('change', async () => {
    file = imageUploader.files
    // show previe to user
    profileDisplay.src = URL.createObjectURL(file[0])
    profileDisplay.style.display = 'block'
})

