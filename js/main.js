// Pokédex intro: the closed cover opens on click, or by itself after a short pause.
const root = document.documentElement;
const cover = document.querySelector('.cover');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let autoOpen;
 
function openDex() {
    if (root.classList.contains('opened')) return;
    clearTimeout(autoOpen);
    root.classList.add('opened');
    cover.disabled = true;
    window.scrollTo(0, 0);
}
 
cover.addEventListener('click', openDex);
autoOpen = setTimeout(openDex, reduceMotion ? 0 : 3500);
 
