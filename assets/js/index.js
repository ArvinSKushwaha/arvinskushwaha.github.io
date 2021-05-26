const loadingWrapper = document.getElementById('loading-wrapper')
const initButton = document.getElementById('init-button')
const introDiv = document.getElementById('intro')
const titleDiv = document.getElementById('title')
const titleWrapperDiv = document.getElementById('title-wrapper')
const menuButton = document.getElementById('menu-button')
const menu = document.getElementsByTagName('menu')[0]
const sectionDivs = document.querySelectorAll('.menu-wrap')

const sections = document.getElementsByClassName('menu-wrap').length;
let currSection = 0;


initButton.addEventListener('click', () => {
    setSection((currSection + 1) % sections);
})

menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('init')
    menu.classList.toggle('show')
})

sectionDivs.forEach((element, index) => {
    element.addEventListener('click', () => {
        setSection(index);
    })
})

function setSection(section) {
    sectionDivs[currSection].classList.remove('active')
    sectionDivs[section].classList.add('active')
    currSection = section
    if (section === 0)
    {
        titleWrapperDiv.classList.remove('init')
        setTimeout(()=>{introDiv.classList.remove('disappear')}, 500)
    }
    else
    {
        introDiv.classList.add('disappear')
        setTimeout(()=>{titleWrapperDiv.classList.add('init')}, 400);
    }
}

setTimeout(() => {
    loadingWrapper.classList.remove('opacity-0')
    loadingWrapper.style.overflowY = 'visible'
    document.querySelector('body').style.overflowY = 'visible'
    document.querySelector('html').style.overflowY = 'visible'
}, 1000)