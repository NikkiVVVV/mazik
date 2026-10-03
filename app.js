const slider = document.querySelector('.product-slider');
const slides = [...slider.querySelectorAll('.product-slide')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
slider.addEventListener('keydown', event => {
  if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
  event.preventDefault();
  const positions = slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
  const current = positions.reduce((best, x, i) => Math.abs(x - slider.scrollLeft) < Math.abs(positions[best] - slider.scrollLeft) ? i : best, 0);
  const next = Math.max(0, Math.min(slides.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)));
  slider.scrollTo({left: positions[next], behavior: reduced.matches ? 'instant' : 'smooth'});
});
const pouch = document.querySelector('.pouch-button');
const reaction = document.querySelector('.pouch-reaction');
const hint = document.querySelector('.pouch-hint');
const phrases = [
  'Селёдка с молоком',
  'Тирамису с чесноком',
  'Оливье с мармеладом',
  'Пельмени в йогурте',
  'Килька в карамели',
  'Борщ с бананом',
  'Пломбир с аджикой',
  'Суши с холодцом',
  'Шпроты с нутеллой',
  'Гречка в сгущёнке',
  'Чизкейк с горчицей',
  'Эклер с тушёнкой',
  'Арбуз под майонезом',
  'Хинкали с зефиром',
  'Капучино на рассоле',
  'Сырники с килькой',
  'Паштет с попкорном',
  'Крабовый рафаэлло',
  'Пицца с киселём',
  'Холодец с изюмом',
];
let squeezes = 0;
let squeezeTimer, reactionTimer, hintTimer;
function dismissHint() {
  clearTimeout(hintTimer);
  hint.classList.remove('is-showing');
}
const hintObserver = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  hint.classList.add('is-showing');
  hintTimer = setTimeout(dismissHint, 4200);
  hintObserver.disconnect();
}, {threshold: .65});
hintObserver.observe(document.querySelector('.pouch-scene'));
pouch.addEventListener('click', () => {
  hintObserver.disconnect();
  dismissHint();
  clearTimeout(squeezeTimer);
  clearTimeout(reactionTimer);
  pouch.classList.remove('is-squeezing');
  reaction.classList.remove('is-visible');
  void pouch.offsetWidth;
  pouch.classList.add('is-squeezing');
  reaction.textContent = phrases[squeezes++ % phrases.length];
  reaction.classList.add('is-visible');
  squeezeTimer = setTimeout(() => pouch.classList.remove('is-squeezing'), 700);
  reactionTimer = setTimeout(() => {
    reaction.classList.remove('is-visible');
    reaction.textContent = '';
  }, 3800);
});

const header = document.querySelector('.site-header');
// A hidden header must also be absent from keyboard and screen-reader navigation.
let headerVisible = false;
function updateHeaderVisibility() {
  const visible = window.scrollY > 48;
  if (visible === headerVisible) return;
  headerVisible = visible;
  header.classList.toggle('is-visible', visible);
  header.inert = !visible;
  header.setAttribute('aria-hidden', String(!visible));
}
window.addEventListener('scroll', updateHeaderVisibility, {passive: true});
window.addEventListener('pageshow', updateHeaderVisibility);
updateHeaderVisibility();

// Silent inline loop; retry when mobile browsers restore the visible page.
const productVideo = document.querySelector('.video-poster');
function playProductVideo() {
  if (document.hidden || !productVideo.paused) return;
  productVideo.muted = true;
  productVideo.play().catch(() => {});
}
productVideo.addEventListener('canplay', playProductVideo, {once: true});
window.addEventListener('pageshow', playProductVideo);
document.addEventListener('visibilitychange', playProductVideo);
document.addEventListener('pointerdown', playProductVideo, {once: true, passive: true});
new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) playProductVideo();
}, {threshold: .1}).observe(productVideo);
playProductVideo();

// Start the first card once, only after it is visible. Never replay on carousel scroll.
const pinDemo = document.querySelector('.pin-demo');
function finishPinDemo() {
  pinDemo.classList.add('is-complete');
  pinDemo.classList.remove('is-playing');
}
const pinObserver = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .6)) return;
  pinObserver.disconnect();
  if (reduced.matches) {
    finishPinDemo();
    return;
  }
  pinDemo.classList.add('is-playing');
  pinDemo.querySelector('.tg-chat-mayonez').addEventListener('animationend', finishPinDemo, {once: true});
}, {threshold: .6});
pinObserver.observe(pinDemo);
reduced.addEventListener('change', () => {
  if (reduced.matches && pinDemo.classList.contains('is-playing')) finishPinDemo();
});
