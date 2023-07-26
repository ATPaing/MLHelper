import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

import {
    getAuth,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'

const createRoomLoading = document.getElementById('createRoomLoading')
const createRoomModel = document.getElementById('createRoomModel')
const createRoomBtn = document.getElementById('createRoomBtn')

const joinRoomModel = document.getElementById('joinRoomModel')


const db = await getFirestore()
const auth = await getAuth()

const randomString = generateRandomString(10);
const uid = sessionStorage.getItem('authToken')

createRoomBtn.addEventListener('click', () => {
    createRoomLoading.style.display = 'flex'
    joinRoomModel.style.display = 'none'
    createRoomModel.style.display = 'flex'
    createRoomModel.innerHTML = `<div class="createRoomLoading__first-row">
                                    <img src="../src/images/loading-gif.gif" alt="hamster running gif">
                                    <p>Creating room. Please wait !</p>
                                </div>`
    onAuthStateChanged(auth, async (user) => {
        if (user && !sessionStorage.getItem('roomKey')) {
            const docRef = doc(db, 'rooms', randomString)
            await setDoc(docRef, {
                peoples: [uid],
                tm_rm_coord: [0,90],
                tm_jgn_coord: [0,120],
                tm_gl_coord: [0,30],
                tm_exp_coord: [0,0],
                tm_mid_coord: [0,60],
                emy_rm_coord: [0,240],
                emy_jgn_coord: [0,270],
                emy_gl_coord: [0,180],
                emy_exp_coord: [0,150],
                emy_mid_coord: [0, 210],
                drawingCoord: {
                },
                erasingCoord: [{}],
                lineColor: 'black',
                snapImgLinks: [],
                status: 'open'
            })
            
            sessionStorage.setItem('roomKey', randomString)
            createRoomModel.innerHTML = `<div class="createRoomLoading__first-row">
                                            <img src="../src/images/gifDone.png" alt="hamster running gif">
                                            <p>Room successfully created !</p>
                                        </div>
                                        <div class="takeRoomBtn">
                                            <a href="../pages/createRoom.html">Take me to the room</a>
                                        </div>`
        } else if (user && sessionStorage.getItem('roomKey')) {
            createRoomModel.innerHTML = `<div class="createRoomLoading__first-row">
                                            <img src="../src/images/gifDone.png" alt="hamster running gif">
                                            <p>Room already existed !</p>
                                        </div>
                                        <div class="takeRoomBtn">
                                            <a href="../pages/createRoom.html">Take me to the room</a>
                                        </div>`
        }
    
    })
})




// generate random number to set as room id
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}
    
