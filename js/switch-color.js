const darkModeIcon = document.querySelector('.dark__mode-icon')
const colorSwitcherIcon = document.querySelector('.color__switcher')
const alternateStyle = document.querySelectorAll('.alternate-style')
const body = document.querySelector('body')
const colors = document.querySelector('.colors')

const openSwitchOptions = () => {
    colors.style.display = 'inline-block'
    setTimeout(() => colors.style.opacity = 1, 50)
}

const closeSwitchOptions = () => {
    colors.style.opacity = 0
    setTimeout(() => colors.style.display = 'none', 300)
}

const setActiveStyle = color => {
    alternateStyle.forEach(style => {
        if(color === style.getAttribute('title')){
            style.removeAttribute('disabled')
            closeSwitchOptions()
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

const switchDarkMode = () => {
    if (darkModeIcon.textContent.trim() === 'dark_mode') {
        darkModeIcon.textContent = 'light_mode'
        body.classList.add('dark')
    } else {
        darkModeIcon.textContent ='dark_mode'
        body.classList.remove('dark')
    }
}

document.addEventListener('click', ({target}) => {
    if (target !== colors && !colors.contains(target) && target !== colorSwitcherIcon) {
        closeSwitchOptions()
    }
})
colorSwitcherIcon.addEventListener('click', switchColor)
darkModeIcon.addEventListener('click', switchDarkMode)
