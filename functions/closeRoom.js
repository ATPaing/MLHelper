import {
    getFirestore,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"



const model = document.getElementById('model')
const closeRoomContent = document.getElementById('closeRoomContent')
const roomKey = sessionStorage.getItem('roomKey')

const closeRoomBtn = document.getElementById('closeRoom')

const db = getFirestore()
const docRef = doc(db, 'rooms', roomKey) 

closeRoomBtn.addEventListener('click', async () => {

    model.style.display = 'flex'
    addAnimationToModelText(closeRoomContent)
    sessionStorage.removeItem('roomKey')
    
    await updateDoc(docRef, {
        peoples: [],
        status : 'close'
    })

    window.location.href = '../pages/index.html'
})

function addAnimationToModelText(el) {
    let dots 
    setInterval(() => {
        dots += '.'
        if (dots.length > 3) {
            dots = '.'
        }
        el.textContent = `Closing room. Please wait${dots}`
    }, 500)
}
