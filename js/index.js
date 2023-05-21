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

    const handleSearch = () => {
        for (let i = 0; i < activitiesContainer.children.length; i++) {
            const child = activitiesContainer.children[i]
            const matchWithSearch = child.getTitle().toLowerCase().indexOf(actionbarInp.value.toLowerCase()) >= 0

            if (matchWithSearch) {
                child.classList.remove('hidden')
            } else {
                child.classList.add('hidden')
            }
        }
    }
    
    actionbarInp.addEventListener('input', handleSearch)

    newBtn.onclick = () => {
        var name = actionbarInp.value.trim()

        if (name.length == 0) {
            name = "Unnamed activity"
        }

        const activityData = {
            title: name,
            registers: []
        }

        data.activities.push(activityData)
        const activityElement = createActivityNode(activityData)
        activitiesContainer.insertBefore(activityElement, activitiesContainer.firstChild)

        actionbarInp.value = ""
        handleSearch()
    }

    exportBtn.onclick = () => {
        save(data)
        window.location.href = "json.html"
    }

    themeButton.onclick = () => {
        save(data)
        window.location.href = "theme.html"
    }

    data.activities.forEach((activityData) => {
        const activityNode = createActivityNode(activityData)
        activitiesContainer.insertBefore(activityNode, activitiesContainer.firstChild)
    })
}

function createActivityNode(activityData) {
    const activityNode = document.createElement('div')
    activityNode.classList.add('activity', 'frame-div')

    const topContainer = document.createElement('div')
    activityNode.appendChild(topContainer);

    const title = document.createElement('h1')
    title.classList.add("activity-title")
    title.innerText = activityData.title
    topContainer.appendChild(title)

    const menu = document.createElement('span')
    menu.classList.add("menu")
    menu.classList.add("activity-menu")
    menu.appendChild(createActivityMenuNode(activityNode, activityData))
    topContainer.appendChild(menu)

    const bottomContainer = document.createElement('div')
    activityNode.appendChild(bottomContainer)

    const timeSpent = document.createElement('p') //Total time spent on the actvity
    bottomContainer.appendChild(timeSpent)

    const startBtn = document.createElement('button')
    startBtn.innerText = "Start activity"
    startBtn.classList.add('activity-start-btn')
    bottomContainer.appendChild(startBtn)

    const fold = document.createElement('input')
    fold.classList.add('activity-fold-registers')
    fold.type = 'checkbox'
    fold.id = randomId()
    activityNode.append(fold)

    const foldLabel = document.createElement('label')
    foldLabel.htmlFor = fold.id
    activityNode.append(foldLabel)

    const registerList = document.createElement('ul')
    registerList.classList.add('activity-registers')
    activityNode.appendChild(registerList)

    activityNode.getTitle = () => {
        return activityData.title
    }

    const addRegister = (registerNode) => {
        if (registerList.children.length > 0) {
            registerList.insertBefore(registerNode, registerList.firstChild)
        } else {
            registerList.appendChild(registerNode)
        }
    }

    activityData.registers.forEach((registerData) => {
        const registerNode = createRegisterNode(activityData.registers, registerData)
        addRegister(registerNode)
    })

    const hasActivedRegisters = () => activityData.registers.filter(registerData => registerData.end == null).length > 0

    updateHandlers.push(() => {
        if (hasActivedRegisters()) {
            startBtn.classList.add('disabled')
        } else startBtn.classList.remove('disabled')

        var time = 0
        activityData.registers.forEach((registerData) => {
            time += registersDuration(registerData)
        })

        timeSpent.innerText = "Total time spent: " + fullTimeFormat(time)

        return false
    })

    startBtn.onclick = () => {
        if (hasActivedRegisters()) return

        const registerData = {
            start: Date.now(),
            end: null
        }
        activityData.registers.push(registerData)


        const registerNode = createRegisterNode(activityData.registers, registerData)
        addRegister(registerNode)
    }

    return activityNode
}

function createActivityMenuNode(activityNode, activityData) {
    const menuDiv = document.createElement('div')

    const option = (label, action) => {
        const btn = document.createElement('button')
        btn.innerText = label
        btn.onclick = (e) => action(event, btn)
        menuDiv.appendChild(btn)
    }

    option('Rename', (event, btn) => {
        const title = activityNode.querySelector(".activity-title")
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
        activityNode.replaceWith(cancel)

        var cancelled = false
        cancel.onclick = () => {
            cancel.replaceWith(activityNode)
            cancelled = true
        }

        const startTimestamp = Date.now()
        updateHandlers.push(() => {
            const remainingTime = parseInt((Date.now() - startTimestamp) / 1000)

            p.innerHTML = 'Deleting in ' + (3 - remainingTime) + 's<br><strong>Click here to cancel</strong>'

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

function createRegisterNode(registers, registerData) {
    const regItem = document.createElement('li')

    const regTime = document.createElement('span')
    regTime.classList.add('activity-register-time')
    regItem.appendChild(regTime)

    const regDate = document.createElement('span')
    regDate.classList.add('activity-register-date')
    regDate.innerText = dateFormat(registerData.start)
    regItem.appendChild(regDate)

    if (registerData.end == null) {
        const regStop = document.createElement('button')
        regStop.classList.add('activity-stop-register')
        regStop.innerText = "Stop"
        regItem.appendChild(regStop)

        regStop.onclick = () => {
            regItem.removeChild(regStop)
            registerData.end = Date.now()
            save(data)
        }

        updateHandlers.push(() => {
            const duration = registersDuration(registerData)
            regTime.innerText = timeFormat(duration)
            regTime.setAttribute('data-content', fullTimeFormat(duration))
            return registerData.end != null
        })
    } else {
        const duration = registersDuration(registerData)
        regTime.innerText = timeFormat(duration)
        regTime.setAttribute('data-content', fullTimeFormat(duration))
    }

    const regDelete = document.createElement('button')
    regDelete.classList.add('activity-delete-register')
    regDelete.innerText = "×"
    regItem.appendChild(regDelete)

    var clicks = 3
    regDelete.onclick = () => {
        clicks--;
        regDelete.innerText = clicks

        if (clicks <= 0) {
            registers.splice(registers.indexOf(registerData), 1)
            regItem.parentNode.removeChild(regItem)
            save(data);
        }
        setTimeout(() => {
            clicks = 3
            regDelete.innerText = '×'
        }, 800)
    }

    return regItem
}

function randomId() {
    var id = ''
    
    for (let i = 0; i < 10; i++) {
        id += String(parseInt(Math.random() * 9999).toString(16)).padStart('0', 4)
    }
    
    return id
}

function registersDuration(registerData) {
    if (registerData.end != null) {
        return registerData.end - registerData.start
    }

    return Date.now() - registerData.start
}

function dateFormat(timestamp) {
    const date = new Date(timestamp)

    const day = String(date.getDate()).padStart(2, '0')
    const mounth = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).padStart(4, '0')

    return day + '/' + mounth + '/' + year
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