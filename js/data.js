function createBlankData() {
    return { activities: [] }
}

function load() {
    const data = window.localStorage.data
    if (data) {
        const json = JSON.parse(data)

        fixActvityData(json)

        return json
    }

    return createBlankData()
}

function fixActvityData(json) {
    json.activities.forEach((activityData) => {
        if (activityData.id === undefined) {
            activityData.id = randomId()
        }

        if (activityData.lastModified === undefined) {
            activityData.lastModified = Date.now();
        }
    })
}

function save(data) {
    if (data) {
        window.localStorage.data = JSON.stringify(data)
    }
}

function randomId() {
    var id = ''

    for (let i = 0; i < 10; i++) {
        id += String(parseInt(Math.random() * 9999).toString(16)).padStart('0', 4)
    }

    return id
}