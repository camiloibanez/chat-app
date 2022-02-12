const rooms = []

const addRoom = (room) => {
    const usedRoom = rooms.find((existingRoom) => existingRoom === room)

    if (!usedRoom) {
        rooms.push(room)
    }

    return rooms
}

const removeRoom = (deadRoom) => {
    const index = rooms.findIndex((room) => deadRoom === room)

    if (index >= 0) {
        return rooms.splice(index, 1)[0]
    }
}

const getRooms = () => rooms

module.exports = {
    addRoom,
    removeRoom,
    getRooms
}