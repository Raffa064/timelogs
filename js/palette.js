applyPallete()

function applyPallete(shift, hue, dark) {
    const pallete = createPallete(shift, hue, dark)
    // pallete.forEach(c => {document.querySelector('main').innerHTML += ('<span style="background: ' + c.hsl() + '; color: transparent; padding: 2px;">®</sparent>')})

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

function createPallete(shift = 45, hue = parseInt(Math.random() * 360), dark = true) {
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