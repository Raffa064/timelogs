const root = document.documentElement
const colors = [
    "backgroundDark",
    "backgroundLight",
    "accentDark",
    "accentLight"
]

var hue = Math.random() * 360
for (let i in colors) {
    root.style.setProperty(
        '--'+colors[i], 
        'hsl('+parseInt(hue)+'deg, 50%, 50%)'
    )
    hue += 360 / colors.length
}