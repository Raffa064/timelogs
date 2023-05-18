const downloadLink = document.querySelector('#download-link')
const json = JSON.stringify(window.location.data)
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
downloadLink.href = url
downloadLink.download = "timelog-export-" + (Date.now() / 1000) + ".json"

const importInp = document.querySelector('#import-inp')
importInp.addEventListener('change', (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        const json = e.target.result
        console.log(json)
    }
    reader.readAsText(file)
})