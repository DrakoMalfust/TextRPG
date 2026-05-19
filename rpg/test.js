function startDungeon () {

    return 'start dungeon'
}


function thiefEvent () {
    return 'unlock locker'
}

function healEvent () {
return '+100 HP'
}
const event_1 = startDungeon()
const event_2 = thiefEvent()
const event_3 = healEvent()


const array = [event_1, event_2, event_3]

console.log(array[Math.floor(Math.random()*array.length)])