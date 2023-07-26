import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    where,
    query
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"


import {
    getAuth,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'

import {
    getRoomData
} from '../custom API/customJoinRoom.js'


// get DOM elements
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const main = document.querySelector('main')
const els = document.getElementsByClassName('sticker')
const players_wrapper = document.getElementById('players_wrapper')
const roomIdEl = document.getElementById('roomIdEl')
const leave_room_btn = document.getElementById('leave_room_btn')
const model = document.getElementById('model')

// init firebase services
const db = getFirestore()
const auth = getAuth()



// get from session storage
const uId = sessionStorage.getItem('authToken')
const roomId = sessionStorage.getItem('roomId')

const docRef =  doc(db, 'rooms', roomId)

// for stickers
let currentX, currentY, currentEl
let stickerX, stickerY
let isStickerPressed = false

// stickers position
let tm_rm_coord, tm_gl_coord, tm_jgn_coord, tm_mid_coord, tm_exp_coord
let emy_rm_coord, emy_gl_coord, emy_jgn_coord, emy_mid_coord, emy_exp_coord



let animationId 
let lineWidth = 5
let drawingCoords = {}
let prevDrawingCoordArr = []
let drawingCoordsArr = []
let drawingCoordsLength 
let erasingCoords = {}
let erasingCoordslength
let prevPeopleArr = []



canvas.width = main.offsetWidth
canvas.height = main.offsetHeight



// show room Id on screen
roomIdEl.textContent = roomId

onSnapshot(docRef, async (docs) => {
    const data = await docs.data()
    console.log('1', data.lineColor)
    if (data.status === 'open') {
        console.log('2', data.lineColor)
        
        // for drawing coords
        drawingCoords = { ...data.drawingCoord }
        console.log(drawingCoords)
        drawingCoordsLength = Object.entries(drawingCoords).length;
        drawingCoordsArr = []
        for (let i = 0; i < drawingCoordsLength; i++) {
            console.log('3', data.lineColor)
            const rawDrawingCoord = convertToRawDrawingCoordinates(...drawingCoords[i][`coord${i}`], canvas.width, canvas.height)
            drawingCoordsArr.push(rawDrawingCoord)
        
        }
    
        if (!arraysAreEqual(drawingCoordsArr, prevDrawingCoordArr)) {
            console.log('4', data.lineColor)
            prevDrawingCoordArr = [...drawingCoordsArr]
            for (let i = 0; i < drawingCoordsArr.length; i++) {
                
                drawOncanvas(...drawingCoordsArr[i], data.lineColor)
            }
            
            
        }
        console.log('===================')
        // for erasing coords
        erasingCoords = [...data.erasingCoord]
        erasingCoordslength = erasingCoords.length;

        const resetData = { coord0: [0, 0] }
        if (shallowEqual(erasingCoords[0], resetData)) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            await updateDoc(docRef, {
                erasingCoord: [{}]
            })
            drawingCoordsArr = []
        } else if (!shallowEqual(erasingCoords[0], resetData) && erasingCoordslength !== 1) {
        
            for (let i = 0; i < erasingCoordslength; i++) {
                const rawErasingCoords = convertToRawErasingCoordinates(...erasingCoords[i][`coord${i}`], canvas.width, canvas.height)
                ctx.clearRect(rawErasingCoords[0], rawErasingCoords[1], 25, 25);
            }
            drawingCoordsArr = []
        }

        const curPeopleArr = data.peoples
        // adding joined players
        if (!arraysAreEqual(prevPeopleArr, curPeopleArr)) {
            prevPeopleArr = [...curPeopleArr]
            if (curPeopleArr.length < 1) {
                players_wrapper.innerHTML = `<p>The room is empty</p>`
            } else if (curPeopleArr.length > 0) {
                players_wrapper.innerHTML = ''

                for (let i = 0; i < curPeopleArr.length; i++) {
            
                    // col ref
                    const colRef = collection(db, 'users')
                    // get authTokem
                    const authToken = curPeopleArr[i]
                    //query the user personal data
                    const q = query(colRef, where('uid', '==', authToken))
    
                    // retrieve document from firebase
                    const docs = await getDocs(q)
                    const userData = docs.docs[0].data()

                    players_wrapper.innerHTML += ` <div class="player">
                                                <img src="${userData.profile_img_link}" alt="">
                                                <p>${userData.name}</p>
                                            </div>`
                }
    
            }
        }

        tm_rm_coord = data.tm_rm_coord
        tm_gl_coord = data.tm_gl_coord
        tm_jgn_coord = data.tm_jgn_coord
        tm_mid_coord = data.tm_mid_coord
        tm_exp_coord = data.tm_exp_coord
        emy_rm_coord = data.emy_rm_coord
        emy_gl_coord = data.emy_gl_coord
        emy_jgn_coord = data.emy_jgn_coord
        emy_mid_coord = data.emy_mid_coord
        emy_exp_coord = data.emy_exp_coord

        // team exp
        els[0].style.left = `${convertToRawXCoord(tm_exp_coord[0], canvas.width)}px`
        els[0].style.top = `${convertToRawYCoord(tm_exp_coord[1], canvas.height)}px`

        // team gold lane
        els[1].style.left = `${convertToRawXCoord(tm_gl_coord[0], canvas.width)}px`
        els[1].style.top = `${convertToRawYCoord(tm_gl_coord[1], canvas.height)}px`

        // team mid lane
        els[2].style.left = `${convertToRawXCoord(tm_mid_coord[0], canvas.width)}px`
        els[2].style.top = `${convertToRawYCoord(tm_mid_coord[1], canvas.height)}px`

        // team roamer
        els[3].style.left = `${convertToRawXCoord(tm_rm_coord[0], canvas.width)}px`
        els[3].style.top = `${convertToRawYCoord(tm_rm_coord[1], canvas.height)}px`

        // team jungler
        els[4].style.left = `${convertToRawXCoord(tm_jgn_coord[0], canvas.width)}px`
        els[4].style.top = `${convertToRawYCoord(tm_jgn_coord[1], canvas.height)}px`

        // enemy exp
        els[5].style.left = `${convertToRawXCoord(emy_exp_coord[0], canvas.width)}px`
        els[5].style.top = `${convertToRawYCoord(emy_exp_coord[1], canvas.height)}px`
    
        // enemy gold lane
        els[6].style.left = `${convertToRawXCoord(emy_gl_coord[0], canvas.width)}px`
        els[6].style.top = `${convertToRawYCoord(emy_gl_coord[1], canvas.height)}px`

        // enemy mid lane
        els[7].style.left = `${convertToRawXCoord(emy_mid_coord[0], canvas.width)}px`
        els[7].style.top = `${convertToRawYCoord(emy_mid_coord[1], canvas.height)}px`

        // enemy roamer
        els[8].style.left = `${convertToRawXCoord(emy_rm_coord[0], canvas.width)}px`
        els[8].style.top = `${convertToRawYCoord(emy_rm_coord[1], canvas.height)}px`

        // enemy jungler
        els[9].style.left = `${convertToRawXCoord(emy_jgn_coord[0], canvas.width)}px`
        els[9].style.top = `${convertToRawYCoord(emy_jgn_coord[1], canvas.height)}px`

    } else if (data.status === 'close') {
        model.style.display = 'block'
        model.classList.add('model_active')
        setTimeout(() => {
            window.location.href = '../pages/index.html'
        },2000)
        
    }
    
})

// add event on stickers
for (let i = 0; i < els.length; i++) {
    // take current position of sticker when pressed
    els[i].addEventListener('mousedown', (e) => {
        // to use for moving the stickers
        currentX = e.offsetX
        currentY = e.offsetY
        // set currentEl
        currentEl = els[i]

        isStickerPressed = true
    });

}

// get the current position when user mouse down on canvas
canvas.addEventListener('mousedown', (e) => {
    // to use for drawing in canvas
    isDrawing = true
    cdx1 = e.offsetX
    cdy1 = e.offsetY

})

// do the action when user move mouse on canvas
canvas.addEventListener('mousemove', async (e) => {
    
    stickerX = normalizeXCoord(e.offsetX, canvas.width)
    stickerY = normalizeYCoord( e.offsetY, canvas.height)
    if (isStickerPressed) { // when the user is moving the sticker 
        animate(e)
        for (let i = 0; i < els.length; i++) {
            els[i].addEventListener('mouseup', async () => {
                
                if (i === 0) {
                    updateDoc(docRef, {
                        tm_exp_coord : [stickerX, stickerY]
                    })
                } else if (i === 1) {
                    updateDoc(docRef, {
                        tm_gl_coord : [stickerX, stickerY]
                    })
                } else if (i === 2) {
                    updateDoc(docRef, {
                        tm_mid_coord : [stickerX, stickerY]
                    })
                } else if (i === 3) {
                    updateDoc(docRef, {
                        tm_rm_coord : [stickerX, stickerY]
                    })
                } else if (i === 4) {
                    updateDoc(docRef, {
                        tm_jgn_coord : [stickerX, stickerY]
                    })
                } else if (i === 5) {
                    updateDoc(docRef, {
                        emy_exp_coord : [stickerX, stickerY]
                    })
                } else if (i === 6) {
                    updateDoc(docRef, {
                        emy_gl_coord : [stickerX, stickerY]
                    })
                } else if (i === 7) {
                    updateDoc(docRef, {
                        emy_mid_coord : [stickerX, stickerY]
                    })
                } else if (i === 8) {
                    updateDoc(docRef, {
                        emy_rm_coord : [stickerX, stickerY]
                    })
                } else if (i === 9) {
                    updateDoc(docRef, {
                        emy_jgn_coord : [stickerX, stickerY]
                    })
                } 
            })
        }
    }
})

function animate(e) {
    if (isStickerPressed) {
        animationId = requestAnimationFrame(animate);
        const finalX = e.offsetX - currentX
        const finalY = e.offsetY - currentY
        currentEl.style.top = `${finalY}px`
        currentEl.style.left = `${finalX}px`
    }
}

function drawOncanvas(x1, y1, x2, y2, lineColor = 'black') {

    ctx.lineCap = 'round'
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.closePath()
    ctx.stroke()
}


// add event to document to stop the drawing and moving sticker
document.addEventListener('mouseup', () => {
    isStickerPressed = false
    cancelAnimationFrame(animationId)
})

// leave room btn
leave_room_btn.addEventListener('click', async () => {
    const people = [...prevPeopleArr]
    const personToRemove = uId
    const filteredPeople = people.filter(person => person !== personToRemove)
    await updateDoc(docRef, {
        peoples: filteredPeople
    })
    sessionStorage.removeItem('roomId')
    window.location.href = '../pages/index.html'
})



function convertToRawDrawingCoordinates(normalizedX1, normalizedY1, normalizedX2, normalizedY2, rawCanvasWidth, rawCanvasHeight) {
    const standardCanvasWidth = 1000
    const standardCanvasHeight = 1000

    const rawX1 = (normalizedX1 / standardCanvasWidth) * rawCanvasWidth;
    const rawY1 = (normalizedY1 / standardCanvasHeight) * rawCanvasHeight;
    const rawX2 = (normalizedX2 / standardCanvasWidth) * rawCanvasWidth;
    const rawY2 = (normalizedY2 / standardCanvasHeight) * rawCanvasHeight;

    return [rawX1.toFixed(4), rawY1.toFixed(4), rawX2.toFixed(4), rawY2.toFixed(4)]
}

function convertToRawErasingCoordinates(normalizedX1, normalizedY1, rawCanvasWidth, rawCanvasHeight) {
    const standardCanvasWidth = 1000
    const standardCanvasHeight = 1000

    const rawX1 = (normalizedX1 / standardCanvasWidth) * rawCanvasWidth;
    const rawY1 = (normalizedY1 / standardCanvasHeight) * rawCanvasHeight;

    return [rawX1.toFixed(4), rawY1.toFixed(4)]
}


function normalizeXCoord(rawX, rawCanvasWidth) {
    const standardCanvasWidth = 1000
    const normalizedX = (rawX / rawCanvasWidth) * standardCanvasWidth;
    return  normalizedX.toFixed(4)
}

function normalizeYCoord(rawY, rawCanvasHeight) {
    const standardCanvasHeight = 1000
    const normalizedY = (rawY / rawCanvasHeight) * standardCanvasHeight;
    return normalizedY.toFixed(4)
}

function convertToRawXCoord(normalizedX, rawCanvasWidth) {
    const standardCanvasWidth = 1000
    const rawX = (normalizedX / standardCanvasWidth) * rawCanvasWidth; 
    return rawX.toFixed(4);
}

function convertToRawYCoord(normalizedY, rawCanvasHeight) {
    const standardCanvasHeight = 1000
    const rawY = (normalizedY / standardCanvasHeight) * rawCanvasHeight;
    return rawY.toFixed(4);
}

// Utility function to compare two arrays for equality
function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

function shallowEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (Array.isArray(object1[key]) && Array.isArray(object2[key])) {
            if (!arraysAreEqual(object1[key], object2[key])) {
                return false;
            }
        } else if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
}