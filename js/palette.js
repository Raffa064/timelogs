handlePaletteUpdate()

function loadTheme() {
    const theme = window.localStorage.theme

    if (theme) {
        return JSON.parse(theme)
    }

    return {
        shift: 45,
        hue: 180,
        dark: false,
    }
}

function saveTheme(theme) {
    if (theme) {
        window.localStorage.theme = JSON.stringify(theme)
    }
}

function handlePaletteUpdate() {
    const { shift, hue, dark } = loadTheme()
    applyPalette(shift, hue, dark)
}

function applyPalette(shift, hue, dark) {
    const pallete = createPalette(shift, hue, dark)
    
    const root = document.documentElement
    root.style.setProperty('--background', pallete[0].hsl())
    root.style.setProperty('--frame', pallete[1].hsl())
    root.style.setProperty('--low-focus-text', pallete[1].hsl())
    root.style.setProperty('--activity-title', pallete[3].hsl())
    root.style.setProperty('--activity-time-spent', pallete[2].hsl())
    root.style.setProperty('--positive-light', pallete[2].hsl())
    root.style.setProperty('--positive-dark', pallete[3].hsl())
    root.style.setProperty('--negative-light', pallete[4].hsl())
    root.style.setProperty('--negative-dark', pallete[5].hsl())
    root.style.setProperty('--accent-light', pallete[2].hsl())
    root.style.setProperty('--accent-dark', pallete[3].hsl())
}

function createPalette(shift = 45, hue = 180, dark = false) {
    const colors = []
    if (dark) {
        colors.push(createColor(hue, 4, 20))
        colors.push(createColor(hue, 20, 50))

        colors.push(createColor(hue, 40, 40))
        colors.push(createColor(hue, 40, 58))

        colors.push(createColor(hue + shift, 40, 40))
        colors.push(createColor(hue + shift, 40, 58))
    } else {
        colors.push(createColor(hue, 4, 90))
        colors.push(createColor(hue, 5, 60))
        colors.push(createColor(hue, 40, 58))
        colors.push(createColor(hue, 40, 40))
        colors.push(createColor(hue + shift, 40, 58))
        colors.push(createColor(hue + shift, 40, 40))
    }
    return colors
}

function createColor(h, s, l) {
    return {
        h,
        s,
        l,
        hsl: () => {
            return 'hsl(' + h + 'deg, ' + s + '%, ' + l + '%)'
        }
    }
}