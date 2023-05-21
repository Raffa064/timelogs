var updateHandlers = []
const data = load()
setInterval(() => save(data), 1000)
update()
setupInterface()

function update() {
    updateHandlers = updateHandlers.filter(i => !i())
    requestAnimationFrame(update)
}

function setupInterface() {
    const main = document.querySelector('main')
    const actionbarInp = document.querySelector('#actionbar-inp')
    const newBtn = document.querySelector('#new-btn')
    const exportBtn = document.querySelector('#export-btn')
    const activitiesContainer = document.querySelector('#activities-container')
    const themeButton = document.querySelector('#theme-btn')

    actionbarInp.addEventListener('input', () => {
        for (let i = 0; i < activitiesContainer.children.length; i++) {
            const child = activitiesContainer.children[i]
            if (child.getTitle().toLowerCase().indexOf(actionbarInp.value.toLowerCase()) >= 0) {
                child.classList.remove('hidden')
            } else {
                child.classList.add('hidden')
            }
        }
    })

    newBtn.onclick = () => {
        if (actionbarInp.value.trim().length == 0) return

        const activity = {
            title: actionbarInp.value,
            registers: []
        }
        data.activities.push(activity)
        const activityElement = createActivity(activity)
        activitiesContainer.insertBefore(activityElement, activitiesContainer.firstChild)

        actionbarInp.value = ""
    }

    exportBtn.onclick = () => {
        save(data)
        window.location.href = "json.html"
    }

    themeButton.onclick = () => {
        applyPallete()
    }

    for (let i = data.activities.length - 1; i >= 0; i--) {
        activitiesContainer.appendChild(createActivity(data.activities[i]))
    }
}

function createActivity(activityData) {
    const activity = document.createElement('div')
    activity.classList.add('activity')
    const div0 = document.createElement('div')
    activity.appendChild(div0);
    const activityTitle = document.createElement('h1')
    activityTitle.classList.add("activity-title")
    activityTitle.innerText = activityData.title
    div0.appendChild(activityTitle)
    const activityMenu = document.createElement('span')
    activityMenu.classList.add("menu")
    activityMenu.classList.add("activity-menu")
    activityMenu.appendChild(createActivityMenu(activity, activityData))
    div0.appendChild(activityMenu)
    const div1 = document.createElement('div')
    activity.appendChild(div1)
    const timeSpent = document.createElement('p')
    div1.appendChild(timeSpent)
    const startActivity = document.createElement('button')
    startActivity.innerText = "Start activity"
    startActivity.classList.add('activity-start-btn')
    div1.appendChild(startActivity)
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

        timeSpent.innerText = "Total time spent: " + fullTimeFormat(time)

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
    
    activity.getTitle = () => {
        return activityData.title
    }

    return activity
}

function createActivityMenu(activity, activityData) {
    const menuDiv = document.createElement('div')

    const option = (label, action) => {
        const btn = document.createElement('button')
        btn.innerText = label
        btn.onclick = (e) => action(event, btn)
        menuDiv.appendChild(btn)
    }

    option('Rename', (event, btn) => {
        const title = activity.querySelector(".activity-title")
        const titleInput = document.createElement('input')
        titleInput.classList.add('activity-title')
        titleInput.value = title.innerText
        titleInput.setAttribute('placeholder', 'Activity name...')
        title.replaceWith(titleInput)
        titleInput.focus()


        titleInput.addEventListener('focusout', () => {
            if (titleInput.value.trim().length > 0) {
                activityData.title = titleInput.value
                title.innerText = titleInput.value
            }
            
            titleInput.replaceWith(title)
        })
    })

    option('Delete', (event, btn) => {
        const cancel = document.createElement('div')
        cancel.classList.add('activity')
        const div = document.createElement('div')
        const p = document.createElement('p')
        p.classList.add('activity-delete-warning')
        div.appendChild(p)
        cancel.appendChild(div)
        activity.replaceWith(cancel)

        var cancelled = false
        cancel.onclick = () => {
            cancel.replaceWith(activity)
            cancelled = true
        }

        const start = Date.now()
        updateHandlers.push(() => {
            const remainingTime = parseInt((Date.now() - start) / 1000)

            p.innerText = 'Deleting in ' + (3 - remainingTime) + 's\nClick here to cancel'

            if (cancelled) return true

            if (remainingTime > 3) {
                data.activities.splice(data.activities.indexOf(activityData), 1)
                cancel.remove()
                return true
            }
        })
    })

    return menuDiv
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
            save(data)
        }

        updateHandlers.push(() => {
            activityRegisterTime.innerText = timeFormat(Date.now() - register.start)
            activityRegisterTime.setAttribute('data-content', fullTimeFormat(Date.now() - register.start))
            return register.end != null
        })
    } else {
        activityRegisterTime.innerText = timeFormat(register.end - register.start)
        activityRegisterTime.setAttribute('data-content', fullTimeFormat(register.end - register.start))
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
            save(data);
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

function fullTimeFormat(time) {
    const s = parseInt(time / 1000 % 60)
    const m = parseInt(time / 60000 % 60)
    const h = parseInt(time / 3600000)

    var str = ''
    if (h > 0) str += h + 'h '
    if (m > 0) str += m + 'm '
    if (s > 0) str += s + 's '

    return str.trim()
}




/*
"{\"activities\":[{\"title\":\"pointer\",\"registers\":[{\"start\":1684419684305,\"end\":1684426833696},{\"start\":1684429543050,\"end\":1684432122601},{\"start\":1684439925822,\"end\":1684446590865},{\"start\":1684491937996,\"end\":1684493024860},{\"start\":1684494230289,\"end\":null}]},{\"title\":\"Dormir\",\"registers\":[]},{\"title\":\"Tomar café \",\"registers\":[{\"start\":1684493020430,\"end\":1684494073768}]},{\"title\":\"Aula\",\"registers\":[{\"start\":1684426832124,\"end\":1684446595894}]},{\"title\":\"Teste\",\"registers\":[{\"start\":1684501845456,\"end\":null}]},{\"title\":\"teste\",\"registers\":[]}]}"
*/