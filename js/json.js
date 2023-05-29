const downloadLink = document.querySelector('#download-link')
const rawLink = document.querySelector('#raw-link')
const importInp = document.querySelector('#import-inp')
const importRawBtn = document.querySelector('#import-raw-btn')
const wipeBtn = document.querySelector("#wipe-btn")

const json = window.localStorage.data
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
downloadLink.href = url
downloadLink.download = "timelog-export.json"
rawLink.href = url

importInp.addEventListener('change', (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        importJSON(e.target.result)
    }
    reader.readAsText(file)
})

importRawBtn.onclick = () => {
    const input = document.createElement("input")
    input.type = "text"
    input.setAttribute("placeholder", "Paste your json here")
    input.onpaste = (e) => {
        try {
            importJSON(e.clipboardData.getData('text'))
            importRawBtn.innerText = "Success"
        } catch(error) {
            console.log(error)
            importRawBtn.innerText = "Error"
        }
        
        input.replaceWith(importRawBtn)
        setTimeout(() => {
            importRawBtn.innerText = "Import Raw"
        }, 1000)
    }
    importRawBtn.replaceWith(input)
}

function handleWipeLabelUpdate() {
    if (window.sessionStorage.deleted === undefined) {
        wipeBtn.innerText = "Wipe data"
    } else {
        wipeBtn.innerText = "Restore data"
    }
}

handleWipeLabelUpdate()
wipeBtn.onclick = () => {
    if (window.sessionStorage.deleted === undefined) {
        window.sessionStorage.deleted = JSON.stringify(load())
        save(createBlankData())
    } else {
        importJSON(window.sessionStorage.deleted)
        delete window.sessionStorage.deleted
    }

    handleWipeLabelUpdate()
}

function importJSON(jsonStr) {
    console.log(jsonStr)
    
    const json = JSON.parse(jsonStr)
    const data = load()

    if (json) {
        json.activities.forEach((activityData) => {
            const oldVersion = data.activities.filter(a => a.id === activityData.id)
            if (oldVersion.length == 0) {
                data.activities.push(activityData)
            } else {
                if (activityData.lastModified > oldVersion[0].lastModified) { //update cloned ctivity if needs
                    oldVersion[0].title = activityData.title
                    oldVersion[0].lastModified = activityData.lastModified
                    oldVersion[0].registers = activityData.registers
                }
            }
        })

        save(data)

        window.location.href = "index.html"
    }
}