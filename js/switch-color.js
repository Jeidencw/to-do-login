import { updateDarkMode, updateUserColor, userIDModule } from "./app.js"

const darkModeIcon = document.querySelector('.dark__mode-icon')
const colorSwitcherIcon = document.querySelector('.color__switcher')
const alternateStyle = document.querySelectorAll('.alternate-style')
const body = document.querySelector('body')
const colors = document.querySelector('.colors')
const colorsSpan = document.querySelectorAll('.colors span')



colorsSpan.forEach(span => {
    span.addEventListener('click', e => {
        const colorClass = e.target.classList[0]
        setActiveStyle(colorClass)
    })
})

const openSwitchOptions = () => {
    colors.style.display = 'inline-block'
    setTimeout(() => colors.style.opacity = 1, 50)
}

const closeSwitchOptions = () => {
    colors.style.opacity = 0
    setTimeout(() => colors.style.display = 'none', 300)
}

const setActiveStyle =  color => {
    const userID = userIDModule.getUserID()
    alternateStyle.forEach(style => {
        if(color === style.getAttribute('title')){
            style.removeAttribute('disabled')
            closeSwitchOptions()
            updateUserColor(userID, color)
            return
        }
        style.setAttribute('disabled', 'true')
    })
}

const switchColor = () => {
    if (window.getComputedStyle(colors).display === 'none') {
        openSwitchOptions()
    } else {
        closeSwitchOptions()
    }
}

export const activeSetActiveStyle = color => setActiveStyle(color)

export const activeDarkMode = () => {
    darkModeIcon.textContent = 'light_mode'
    body.classList.add('dark')
}

export const activeLightMode = () => {
    darkModeIcon.textContent ='dark_mode'
    body.classList.remove('dark')
}

const switchDarkMode = () => {
    const userID = userIDModule.getUserID()
    if (darkModeIcon.textContent.trim() === 'dark_mode') {
        activeDarkMode()
        updateDarkMode(userID)
    } else {
        activeLightMode()
        updateDarkMode(userID)
    }
}

document.addEventListener('click', ({target}) => {
    if (target !== colors && !colors.contains(target) && target !== colorSwitcherIcon) {
        closeSwitchOptions()
    }
})

colorSwitcherIcon.addEventListener('click', switchColor)
darkModeIcon.addEventListener('click', switchDarkMode)