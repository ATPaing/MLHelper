import {
    getRoomData
} from '../custom API/customJoinRoom.js'

const roomKey_input_form = document.getElementById('roomKey_input_form')
const joinRoomModel = document.getElementById('joinRoomModel')
const joinRoomBtn = document.getElementById('joinRoomBtn')
const createRoomLoading = document.getElementById('createRoomLoading')
const createRoomModel = document.getElementById('createRoomModel')
const cancel_button = document.getElementById('cancel_button')





joinRoomBtn.addEventListener('click', () => {
    createRoomLoading.style.display = 'flex'
    createRoomModel.style.display = 'none'
    joinRoomModel.style.display = 'flex'
})

roomKey_input_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const roomId = roomKey_input_form.roomkey.value
    const uId = sessionStorage.getItem('authToken')
    sessionStorage.setItem('roomId', roomId)
    getRoomData(uId, roomId)
    roomKey_input_form.roomkey.value = ''
})



cancel_button.addEventListener('click', () => {
    createRoomLoading.style.display = 'none'
})
