import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"



// get DOM elements
const profileImageHoler = document.getElementById('profile-picture')
const profileName = document.getElementById('profile_name')
const loadingModel = document.getElementById('loading_model')
const loadingText = document.getElementById('loading_text')
const navRight = document.getElementById('nav_right')


// add dots(...) on loading model display
let dots 
setInterval(() => {
    dots += '.'
    if (dots.length > 3) {
        dots = '.'
    }
    loadingText.textContent = `Loading${dots}`
}, 500)

// init service
const db = getFirestore()

// col ref
const colRef = collection(db, 'users')

// get authTokem
const authToken = sessionStorage.getItem('authToken')

//query the user personal data
const q = query(colRef, where('uid', '==', authToken))

// retrieve document from firebase
const docs = await getDocs(q)
const docData = docs.docs[0].data()
console.log(docData.profile_img_link)
console.log(docData.name)
// add data to DOM
profileImageHoler.src = docData.profile_img_link
profileName.textContent = docData.name

// update DOM after profile picture successfully loaded
profileImageHoler.addEventListener('load', () => {
    loadingModel.style.display = 'none'
    navRight.style.display = 'flex'
})

createRoomBtn.addEventListener('click', () => {

})



