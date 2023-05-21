function load() {
    const data = window.localStorage.data
    if (data) {
        return JSON.parse(data)
    }

    return {
        activities: []
    }
}

function save(data) {
    if (data) {
        window.localStorage.data = JSON.stringify(data)
    }
}