const downloadLink = document.querySelector('#download-link')
const json = JSON.stringify(window.localStorage.data)
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
downloadLink.href = url
downloadLink.download = "timelog-export-" + (Date.now() / 1000) + ".json"

const importInp = document.querySelector('#import-inp')
importInp.addEventListener('change', (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        importJSON(e.target.result)
    }
    reader.readAsText(file)
})

function importJSON(jsonStr) {
    console.log("importJSON")
    const json = JSON.parse(jsonStr)
    const data = load()

    if (json.activities) {
        for (let i in json.activities) {
            const activity = json.activities[i]
            data.activities.push(activity)
        }
    }
}