const tools = document.getElementsByClassName('tool')

const ctx = canvas.getContext('2d') // canvas element was declared in dra-drop.js

let cdx1, cdy1, cdx2, cdy2 // for coords to draw in canvas

for (let i = 0; i < tools.length; i++){
    tools[i].addEventListener('click', () => {
        if (i === 0) {
            canvas.style.cursor = 'url(../src/images/tools/draw-cursor.svg),auto'
        } else if (i === 1) {
            canvas.style.cursor = 'url(../src/images/tools/erase-cursor.svg),auto'
        } else if (i === 2) {
            
        } else if (i === 3) {
        
        }
    })
}

canvas.addEventListener('mousedown', (e) => {
    cdx1 = e.offsetX
    cdy1 = e.offsetY
})

canvas.addEventListener('mouseup', (e) => {
    cdx2 = e.offsetX
    cdy2 = e.offsetY
})


function drawOncanvas(x1,y1,x2,y2) {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}