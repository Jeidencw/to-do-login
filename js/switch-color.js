const darkModeIcon = document.querySelector('.dark__mode-icon')
const body = document.querySelector('body')

darkModeIcon.addEventListener('click', () => {
    if(darkModeIcon.textContent.trim() == 'dark_mode'){
        darkModeIcon.textContent = 'light_mode'
        body.classList.add('dark')
    }else{
        darkModeIcon.textContent ='dark_mode'
        body.classList.remove('dark')
    }
})

