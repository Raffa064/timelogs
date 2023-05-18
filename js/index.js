var updateHandlers = []
const data = load()
setInterval(save, 1000)
update()
setupInterface()

function update() {
    updateHandlers = updateHandlers.filter(i => !i())
    requestAnimationFrame(update)
}

function setupInterface() {
    const main = document.querySelector('main')
    const inpTitle = document.querySelector('#inp-title')
    const newBtn = document.querySelector('#new-btn')
    const exportBtn = document.querySelector('#export-btn')
    
    newBtn.onclick = () => {
        if (inpTitle.value.trim().length == 0) return

        const activity = {
            title: inpTitle.value,
            registers: []
        }
        data.activities.push(activity)
        main.appendChild(createActivity(activity))

        inpTitle.value = ""
    }
    
    exportBtn.onclick = () => {
        save()
        window.location.href = "json.html"
    }
    
    for (let i in data.activities) {
        main.appendChild(createActivity(data.activities[i]))
    }
}

function createActivity(activityData) {
    const activity = document.createElement('div')
    activity.classList.add('activity')
    const activityTitle = document.createElement('activityTitle')
    activityTitle.classList.add("activity-title")
    activityTitle.innerText = activityData.title
    activity.appendChild(activityTitle)
    const div = document.createElement('div')
    activity.appendChild(div)
    const timeSpent = document.createElement('p')
    div.appendChild(timeSpent)
    const startActivity = document.createElement('button')
    startActivity.innerText = "Start activity"
    startActivity.classList.add('activity-start-btn')
    div.appendChild(startActivity)
    const activityRegisters = document.createElement('ul')
    activityRegisters.classList.add('activity-registers')
    activity.appendChild(activityRegisters)

    const addRegister = (r) => {
        if (activityRegisters.children.length > 0) {
            activityRegisters.insertBefore(r, activityRegisters.firstChild)
        } else {
            activityRegisters.appendChild(r)
        }
    }

    for (let i in activityData.registers) {
        const r = createRegister(activityData.registers, activityData.registers[i])
        addRegister(r)
    }

    const hasActivedRegisters = () => activityData.registers.filter(re => re.end == null).length

    updateHandlers.push(() => {
        if (hasActivedRegisters()) {
            startActivity.classList.add('disabled')
        } else startActivity.classList.remove('disabled')

        var time = 0
        for (let i in activityData.registers) {
            const e = activityData.registers[i]
            if (e.end != null) {
                time += e.end - e.start
            } else {
                time += Date.now() - e.start
            }
        }

        timeSpent.innerText = "Total time spent: " + timeFormat(time)

        return false
    })

    startActivity.onclick = () => {
        if (hasActivedRegisters()) return

        const register = {
            start: Date.now(),
            end: null
        }
        activityData.registers.push(register)


        const r = createRegister(activityData.registers, register)
        addRegister(r)
    }

    return activity
}

function createRegister(registers, register) {
    const listItem = document.createElement('li')
    const activityRegisterTime = document.createElement('span')
    activityRegisterTime.classList.add('activity-register-time')
    activityRegisterTime.innerText = '00:53'
    listItem.appendChild(activityRegisterTime)
    const activityRegisterDate = document.createElement('span')
    activityRegisterDate.classList.add('activity-register-date')
    activityRegisterDate.innerText = dateFormat(register.start)
    listItem.appendChild(activityRegisterDate)

    if (register.end == null) {
        const activityStopRegister = document.createElement('button')
        activityStopRegister.classList.add('activity-stop-register')
        activityStopRegister.innerText = "Stop"
        listItem.appendChild(activityStopRegister)

        activityStopRegister.onclick = () => {
            listItem.removeChild(activityStopRegister)
            register.end = Date.now()
            save()
        }

        updateHandlers.push(() => {
            activityRegisterTime.innerText = timeFormat(Date.now() - register.start)
            return register.end != null
        })
    } else {
        activityRegisterTime.innerText = timeFormat(register.end - register.start)
    }

    const activityDeleteRegister = document.createElement('button')
    activityDeleteRegister.classList.add('activity-delete-register')
    activityDeleteRegister.innerText = "×"
    listItem.appendChild(activityDeleteRegister)

    var clicks = 3
    activityDeleteRegister.onclick = () => {
        clicks--;
        activityDeleteRegister.innerText = clicks

        if (clicks <= 0) {
            registers.splice(registers.indexOf(register), 1)
            listItem.parentNode.removeChild(listItem)
            save();
        }
        setTimeout(() => {
            clicks = 3
            activityDeleteRegister.innerText = '×'
        }, 800)
    }

    return listItem
}

function dateFormat(timestamp) {
    const date = new Date(timestamp)
    return String(date.getDate()).padStart(2, '0') + '/' +
        String(date.getMonth() + 1).padStart(2, '0') + '/' +
        String(date.getFullYear()).padStart(4, '0')
}

function timeFormat(time) {
    if (time < 1000) {
        return time + "ms"
    }

    if (time < 60000) {
        return parseInt(time / 1000) + "s"
    }

    if (time < 3600000) {
        return parseInt(time / 60000) + "m"
    }

    if (time < 86400000) {
        return parseInt(time / 3600000) + "h"
    }

    return parseInt(time / 86400000) + "d"
}

function load() {
    if (window.localStorage.data) {
        return JSON.parse(window.localStorage.data)
    } else {
        return {
            activities: []
        }
    }
}

function save() {
    window.localStorage.data = JSON.stringify(data)
}