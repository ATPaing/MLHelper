import {
    getFirestore,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

const db = await getFirestore()


export async function getRoomData(uId, roomId, bool = false) {

    const docRef = await doc(db, 'rooms', roomId)
    const docSnap = await getDoc(docRef)

    let joined_players = []
    let data

    data = docSnap.data()

    if (!bool) {
        if (!data) {
            const warningEL = document.getElementById('warning')
            warningEL.style.display = 'block'
        } else if (data) {
            joined_players = [...data.peoples]
            if (!joined_players.includes(uId)) {
                joined_players.push(uId)
                await updateDoc(docRef, {
                    peoples: [...joined_players]
                })
            } else {
                console.log('player already exist')
            }
            window.location.href = '../pages/joinRoom.html'
        }
    } else {
        return data
    }
}