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
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js"

import {
    getAuth,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'


const main_screen = document.getElementById('main_screen')
const canvas = document.getElementById('canvas')
const copyCanvas = document.getElementById('copy_canvas')
const ctx = canvas.getContext('2d')
const copyCtx = copyCanvas.getContext('2d')
const els = document.getElementsByClassName('sticker')
const tools = document.getElementsByClassName('tool')
const colors = document.getElementsByClassName('color')
const color_picker = document.getElementById('color_picker')
const snapCollection = document.getElementById('snapCollection')
const join_players = document.getElementById('Join_Players')
const roomID = document.getElementById('roomID')

let currentX, currentY, currentEl
let isPencilChosen = false, isErasrChosen = false
let isStickerPressed = false, isDrawing = false
let animationId
let lineColor = 'black'
let lineWidth = 5
let cdx1, cdy1, cdx2, cdy2
let stickerX, stickerY

// array that will stored the coord of drawing and stored in firestore
let coordArr = []
// that is for erase coord
let eraseCoordArr = []
// to store saved snaps link and post to firebase
let saveSnapLinksArr = []

// stickers position
let tm_rm_coord, tm_gl_coord, tm_jgn_coord, tm_mid_coord, tm_exp_coord
let emy_rm_coord, emy_gl_coord, emy_jgn_coord, emy_mid_coord, emy_exp_coord

// set canvas widht and height
canvas.width = main_screen.offsetWidth
canvas.height = main_screen.offsetHeight
// set copyCanvas width and height
copyCanvas.width = main_screen.offsetWidth
copyCanvas.height = main_screen.offsetHeight

// for drawing image on canvas when the user clicked save
const image = new Image()
image.src = '../src/images/Celestial_Palace_Map 1.png'
image.width = copyCanvas.width
image.height = copyCanvas.height

// to improve image quality when scaled in canvas
copyCtx.imageSmoothingEnabled = false;

// for canvas font size
const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
const remValue = 0.5; //  desired rem value
const fontSizeInPixels = remValue * rootFontSize;


const roomKey = sessionStorage.getItem('roomKey')

// init firebaser services
const db = getFirestore()
const storage = getStorage()
const auth = getAuth()
// const colRef = collection(db, 'rooms')
const docRef =  doc(db, 'rooms', roomKey) // docRef for room key

let prevPeopleArr = []
let prevSnapImgLinksArr = []

// show room id on scren
roomID.textContent = roomKey

onAuthStateChanged(auth, () => {
    onSnapshot(docRef, async (docs) => {
        
        tm_rm_coord = docs.data().tm_rm_coord
        tm_gl_coord = docs.data().tm_gl_coord
        tm_jgn_coord = docs.data().tm_jgn_coord
        tm_mid_coord = docs.data().tm_mid_coord
        tm_exp_coord = docs.data().tm_exp_coord
        emy_rm_coord = docs.data().emy_rm_coord
        emy_gl_coord = docs.data().emy_gl_coord
        emy_jgn_coord = docs.data().emy_jgn_coord
        emy_mid_coord = docs.data().emy_mid_coord
        emy_exp_coord = docs.data().emy_exp_coord
    
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

        const curPeopleArr = await docs.data().peoples
        const curSnapsLinkArr = await docs.data().snapImgLinks

        saveSnapLinksArr = [...curSnapsLinkArr]

        // run when new people joined the group 
        if (!arraysAreEqual(prevPeopleArr,curPeopleArr)) {
            prevPeopleArr = [...curPeopleArr]
            if (curPeopleArr.length < 1) {
                join_players.innerHTML = `<p>The room is empty</p>`
            } else if (curPeopleArr.length > 0) {
                join_players.innerHTML = ''

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

        
        
                    join_players.innerHTML += ` <div class="player">
                                                    <img src="${userData.profile_img_link}" alt="">
                                                    <p>${userData.name}</p>
                                                </div>`
                }
        
            }
        } 

        // run when new snaps are saved
        if (!arraysAreEqual(prevSnapImgLinksArr, curSnapsLinkArr)) {
            prevSnapImgLinksArr = [...curSnapsLinkArr]
            snapCollection.innerHTML =''
            for (let i = 0; i < curSnapsLinkArr.length; i++) {
                snapCollection.innerHTML += `<div class="snap">
                                                <img class="snap_bg" src="${curSnapsLinkArr[i]}" alt="saved snap">
                                                <a href="${curSnapsLinkArr[i]}" class="view snap__button" target="_blank">
                                                    <p>View</p>
                                                </a>
                                                <!-- 
                                                *** currently commented out download and delete button due to CORS problem. ***
                                                    <a class="download snap__button">
                                                        <img src="../src/images/tools/download.svg" alt="download">
                                                        <p>Download</p>
                                                    </a>
                                                    <div class="delete snap__button">
                                                        <img src="../src/images/tools/delete.svg" alt="delete">
                                                        <p>Delete</p>
                                                    </div> 
                                                -->
                                            </div>`
            }
        }

    })
    
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

// add event to tools
for (let i = 0; i < tools.length; i++){
    tools[i].addEventListener('click', async () => {
        if (i === 0) { // draw tool
            isErasrChosen = false
            isPencilChosen = true
            canvas.style.cursor = 'url(../src/images/tools/draw-cursor.svg) 0 50,auto'
        } else if (i === 1) { // erase tool
            isPencilChosen = false
            isErasrChosen = true  
            canvas.style.cursor = 'url(../src/images/tools/erase-cursor.svg) 0 -10,auto'
        } else if (i === 2) { // move tool
            isPencilChosen = false
            isErasrChosen = false
            isDrawing = false
            canvas.style.cursor = 'url(../src/images/tools/move-cursor.svg),auto'
        } else if (i === 3) { // reset tool
            isPencilChosen = false
            isErasrChosen = false
            isDrawing = false
            canvas.style.cursor = 'auto'
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            await updateDoc(docRef, {
                drawingCoord: {},
                erasingCoord: [{coord0: [0,0]}]
            })
        } else if (i === 4) { // save tool
            copyCanvas.style.display = 'block'
            copyCtx.drawImage(image, 0, 0, copyCanvas.width, copyCanvas.height)
            copyCtx.drawImage(canvas, 0, 0,  copyCanvas.width,  copyCanvas.height)
            const docData = await getDoc(docRef)
            const [tm_rm_coord_X,tm_rm_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().tm_rm_coord[0], docData.data().tm_rm_coord[1], canvas.width, canvas.height)
            const [tm_gl_coord_X,tm_gl_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().tm_gl_coord[0], docData.data().tm_gl_coord[1], canvas.width, canvas.height)
            const [tm_jgn_coord_X,tm_jgn_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().tm_jgn_coord[0], docData.data().tm_jgn_coord[1], canvas.width, canvas.height)
            const [tm_mid_coord_X,tm_mid_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().tm_mid_coord[0], docData.data().tm_mid_coord[1], canvas.width, canvas.height)
            const [tm_exp_coord_X, tm_exp_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().tm_exp_coord[0], docData.data().tm_exp_coord[1], canvas.width, canvas.height)
            const [emy_rm_coord_X, emy_rm_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().emy_rm_coord[0], docData.data().emy_rm_coord[1], canvas.width, canvas.height)
            const [emy_gl_coord_X, emy_gl_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().emy_gl_coord[0], docData.data().emy_gl_coord[1], canvas.width, canvas.height)
            const [emy_jgn_coord_X, emy_jgn_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().emy_jgn_coord[0], docData.data().emy_jgn_coord[1], canvas.width, canvas.height)
            const [emy_mid_coord_X, emy_mid_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().emy_mid_coord[0], docData.data().emy_mid_coord[1], canvas.width, canvas.height)
            const [emy_exp_coord_X, emy_exp_coord_Y] = convertNormalizedStickerCoordToRawCoords(docData.data().emy_exp_coord[0], docData.data().emy_exp_coord[1], canvas.width, canvas.height)

            // rm background (team)
            copyCtx.beginPath()
            copyCtx.arc(tm_rm_coord_X + (25 / 2), tm_rm_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "white"
            copyCtx.fill()
            // rm text 
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'black';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('RM', tm_rm_coord_X + (25 / 2), tm_rm_coord_Y + (25 / 2));

            // gl background (team)
            copyCtx.beginPath()
            copyCtx.arc(tm_gl_coord_X + (25 / 2), tm_gl_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "white"
            copyCtx.fill()
            // gl text
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'black';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('GL', tm_gl_coord_X + (25 / 2), tm_gl_coord_Y + (25 / 2));

            // jgn background (team)
            copyCtx.beginPath()
            copyCtx.arc(tm_jgn_coord_X + (25 / 2), tm_jgn_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "white"
            copyCtx.fill()
            // jgn text
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'black';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('Jgn', tm_jgn_coord_X + (25 / 2), tm_jgn_coord_Y + (25 / 2));

            // mid background (team)
            copyCtx.beginPath()
            copyCtx.arc(tm_mid_coord_X + (25 / 2), tm_mid_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "white"
            copyCtx.fill()
            // mid text
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'black';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('Mid', tm_mid_coord_X + (25 / 2), tm_mid_coord_Y + (25 / 2));

            // exp background (team)
            copyCtx.beginPath()
            copyCtx.arc(tm_exp_coord_X + (25 / 2), tm_exp_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "white"
            copyCtx.fill()
            // exp text
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'black';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('Exp', tm_exp_coord_X + (25 / 2), tm_exp_coord_Y + (25 / 2));

            // rm background (enemy)
            copyCtx.beginPath()
            copyCtx.arc(emy_rm_coord_X + (25 / 2), emy_rm_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "black"
            copyCtx.fill()
            // rm text 
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'white';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('RM', emy_rm_coord_X + (25 / 2), emy_rm_coord_Y + (25 / 2));
            
            // GL background (enemy)
            copyCtx.beginPath()
            copyCtx.arc(emy_gl_coord_X + (25 / 2), emy_gl_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "black"
            copyCtx.fill()
            // GL text 
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'white';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('GL', emy_gl_coord_X + (25 / 2), emy_gl_coord_Y + (25 / 2));

            // Jgn background (enemy)
            copyCtx.beginPath()
            copyCtx.arc(emy_jgn_coord_X + (25 / 2), emy_jgn_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "black"
            copyCtx.fill()
            // Jgn text 
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'white';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('Jgn', emy_jgn_coord_X + (25 / 2), emy_jgn_coord_Y + (25 / 2));

            // Mid background (enemy)
            copyCtx.beginPath()
            copyCtx.arc(emy_mid_coord_X + (25 / 2),  emy_mid_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "black"
            copyCtx.fill()
            // Mid text 
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'white';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('Mid', emy_mid_coord_X + (25 / 2), emy_mid_coord_Y + (25 / 2));

            // Exp background (enemy)
            copyCtx.beginPath()
            copyCtx.arc(emy_exp_coord_X + (25 / 2), emy_exp_coord_Y + (25 / 2), 25/2, 0, 2 * Math.PI)
            copyCtx.fillStyle = "black"
            copyCtx.fill()
            // Exp text 
            copyCtx.font = `500 ${fontSizeInPixels}px Poppins`;
            copyCtx.fillStyle = 'white';
            copyCtx.textAlign = 'center';
            copyCtx.textBaseline = 'middle';
            copyCtx.fillText('Exp', emy_exp_coord_X + (25 / 2), emy_exp_coord_Y + (25 / 2));

            const dataURL = copyCanvas.toDataURL();

            //'dataURL' contains the data URL you received
            const base64Data = dataURL.split(',')[1]; // Extract base64-encoded image data
            const byteCharacters = atob(base64Data); // Decode base64 data

            // Create an array buffer to hold the binary data
            const byteNumbers = [...byteCharacters];

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            // Create a Blob object from the array buffer
            const blob = new Blob([byteArray], { type: 'image/png' }); // Replace 'image/png' with the appropriate MIME type if needed
            const blobWithName = {
                blob: blob,
                name: `Image${saveSnapLinksArr.length}.png`
            }
            // Create a URL for the Blob
            // const imageURL = URL.createObjectURL(blob);

            // Use 'imageURL' as the direct link to the image
            const savedSnapRef = await ref(storage, `savedSnapsFrom-${roomKey}/${blobWithName.name}`)
            await uploadBytes(savedSnapRef, blob)
            const imgLink = await getDownloadURL(savedSnapRef)
            saveSnapLinksArr.push(imgLink)
            
            await updateDoc(docRef, {
                snapImgLinks : saveSnapLinksArr
            })
            
            
            copyCanvas.style.display = 'none'
        }
    })
}

for (let i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', () => {
        if (i === 0) {
            lineColor = 'rgb(255, 87, 87)'
        } else if (i === 1) {
            lineColor = 'rgb(53, 240, 53)'
        } else if (i === 2) {
            lineColor = 'rgb(38, 112, 250)'
        } else {
            lineColor = 'black'
        }
        updateDoc(docRef, {
            lineColor : lineColor
        })
    })
}

color_picker.addEventListener('input', () => {
    lineColor = color_picker.value
    updateDoc(docRef, {
        lineColor : lineColor
    })
})

// get the current position when user mouse down on canvas
canvas.addEventListener('mousedown', (e) => {
    // to use for drawing in canvas
    isDrawing = true
    cdx1 = e.offsetX
    cdy1 = e.offsetY

    // *need to reset the array after updating to the firebase on mousemove
    // *otherwise the array will get bigger and bigger which is not what we wanted
    coordArr = []
    eraseCoordArr = []

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
    } else if (!isStickerPressed && isDrawing && isPencilChosen) { // when the user is drawing on canvas
        
        console.log(coordArr)
        cdx2 = e.offsetX
        cdy2 = e.offsetY

        // change to object from array
        coordArr.push([cdx1, cdy1, cdx2, cdy2])
        const coords = coordArr.map((coord, i) => {
            
            return {
                [`coord${i}`]: normalizeDrawingCoordinates(coord[0], coord[1], coord[2], coord[3], canvas.width, canvas.height)
            }
        })
        // update the array to firestore
        updateDoc(docRef, {
            drawingCoord: {
                ...coords
            }
        })

        drawOncanvas(cdx1, cdy1, cdx2, cdy2)
        
        // *the starting coords(cdx1,cdy1) need to be updated 
        // *to the corrds where mouse current(cdx2,cdy2) is
        // *it can cause the line starting from the same point if not updated
        cdx1 = cdx2
        cdy1 = cdy2
        
    } else if (!isStickerPressed && isDrawing && isErasrChosen) { // when the user is erasing on canvas
        // change to object from array
        eraseCoordArr.push([e.offsetX, e.offsetY])
        const coords = eraseCoordArr.map((x, i) => {
            return {
                [`coord${i}`]: normalizeErasingCoordinates(x[0], x[1], canvas.width, canvas.height)
            }
        })
        updateDoc(docRef, {
            drawingCoord: {},
            erasingCoord : [...coords]
        })
        ctx.clearRect(e.offsetX, e.offsetY, 25, 25)
    }
})

// stop drawing when user mouse up on canvas
canvas.addEventListener('mouseup', (e) => {
    isDrawing = false
    updateDoc(docRef, {
        drawingCoord: {}
    })
})

// add event to document to stop the drawing and moving sticker
document.addEventListener('mouseup', () => {
    isStickerPressed = false
    cancelAnimationFrame(animationId)
});

// adjust the line width for drawing based on user mouse wheel up/down
document.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
        lineWidth++
        if (lineWidth > 50) {
            lineWidth = 50
        }
    } else if (e.deltaY < 0) {
        lineWidth--
        if (lineWidth < 1) {
            lineWidth = 1
        }
    }
})

// move the stickers around the map
function animate(e) {
    if (isStickerPressed) {
        animationId = requestAnimationFrame(animate);
        const finalX = e.offsetX - currentX
        const finalY = e.offsetY - currentY
        currentEl.style.top = `${finalY}px`
        currentEl.style.left = `${finalX}px`
    }
}

// draw lines on canvas
function drawOncanvas(x1, y1, x2, y2) {

    ctx.lineCap = 'round'
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.closePath()
    ctx.stroke()
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

function normalizeErasingCoordinates(rawX1, rawY1, rawCanvasWidth, rawCanvasHeight) {
    const standardCanvasWidth = 1000
    const standardCanvasHeight = 1000

    const normalizedX1 = (rawX1 / rawCanvasWidth) * standardCanvasWidth;
    const normalizedY1 = (rawY1 / rawCanvasHeight) * standardCanvasHeight;

    return [normalizedX1.toFixed(4),normalizedY1.toFixed(4)]
}

function normalizeDrawingCoordinates(rawX1, rawY1, rawX2, rawY2, rawCanvasWidth, rawCanvasHeight) {
    const standardCanvasWidth = 1000
    const standardCanvasHeight = 1000

    const normalizedX1 = (rawX1 / rawCanvasWidth) * standardCanvasWidth;
    const normalizedY1 = (rawY1 / rawCanvasHeight) * standardCanvasHeight;
    const normalizedX2 = (rawX2 / rawCanvasWidth) * standardCanvasWidth;
    const normalizedY2 = (rawY2 / rawCanvasHeight) * standardCanvasHeight;

    return [normalizedX1.toFixed(4),normalizedY1.toFixed(4),normalizedX2.toFixed(4),normalizedY2.toFixed(4)]
}

function convertNormalizedStickerCoordToRawCoords(normalizedX, normalizedY, canvasWidth, canvasHeight) {
    const standardCanvasWidth = 1000
    const standardCanvasHeight = 1000
    const rawX = (normalizedX / standardCanvasWidth) * canvasWidth
    const rawY = (normalizedY / standardCanvasHeight) * canvasHeight
    return [rawX, rawY]
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