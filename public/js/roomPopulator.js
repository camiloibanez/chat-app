const socket = io()

const dropdown = document.querySelector('#rooms')
const optionsTemplate = document.querySelector('#room-option-template').innerHTML
const roomInput = document.querySelector('#room-input')

socket.on('roomsInUse', (rooms) => {
    dropdown.innerHTML = ''
    
    const headHTML = '<option disabled selected>Open Rooms</option>'
    dropdown.insertAdjacentHTML("afterbegin", headHTML)

    rooms.forEach((room) => {
        const html = Mustache.render(optionsTemplate, {
            room
        })
        dropdown.insertAdjacentHTML("beforeend", html)
    });
})

const selectRoom = (e) => {
    roomInput.value = e.target.value
}