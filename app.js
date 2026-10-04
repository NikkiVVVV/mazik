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
let squeezeTimer, reactionTimer;
pouch.addEventListener('click', () => {
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

// Play the supplied pinning recording once per page visit, when its card is visible.
const pinDemo = document.querySelector('.pin-demo');
const pinVideo = document.querySelector('.pin-video');
let pinVisible = false;
let pinComplete = false;
let pinZoomFrame;
const smoothPinZoom = value => {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
};
function updatePinZoom() {
  const t = pinVideo.currentTime;
  const zoom = reduced.matches || pinComplete ? 0
    : smoothPinZoom((t - 2.6) / .7) * (1 - smoothPinZoom((t - 6.35) / .7));
  pinVideo.style.transform = `translate(${-60 * zoom}%, ${-80 * zoom}%) scale(${1 + .6 * zoom})`;
}
function animatePinZoom() {
  updatePinZoom();
  if (!pinVideo.paused && !pinVideo.ended) pinZoomFrame = requestAnimationFrame(animatePinZoom);
}
pinVideo.addEventListener('playing', () => {
  cancelAnimationFrame(pinZoomFrame);
  animatePinZoom();
});
pinVideo.addEventListener('pause', () => cancelAnimationFrame(pinZoomFrame));
pinVideo.addEventListener('seeked', updatePinZoom);

function finishPinDemo() {
  pinComplete = true;
  pinVideo.pause();
  pinDemo.classList.add('is-complete');
  updatePinZoom();
}
function playPinDemo() {
  if (pinComplete || !pinVisible || document.hidden || reduced.matches) return;
  pinVideo.muted = true;
  pinVideo.play().catch(() => {});
}
const pinObserver = new IntersectionObserver(entries => {
  pinVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .6;
  if (pinVisible) playPinDemo();
  else pinVideo.pause();
}, {threshold: [0, .6]});
pinObserver.observe(pinDemo);
pinVideo.addEventListener('ended', () => {finishPinDemo(); pinObserver.disconnect();});
pinVideo.addEventListener('canplay', playPinDemo);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pinVideo.pause();
  else playPinDemo();
});
document.addEventListener('pointerdown', playPinDemo, {passive: true});
function applyPinMotionPreference() {
  if (!reduced.matches) return;
  finishPinDemo();
  pinVideo.poster = 'assets/pin-bot-final.jpg';
  pinObserver.disconnect();
}
reduced.addEventListener('change', applyPinMotionPreference);
applyPinMotionPreference();

// One reveal sequence for the three ways to log food. Pause while off screen.
const entryDemo = document.querySelector('.entry-demo');
let entryStarted = false;
let entryVisible = false;
let entryComplete = false;
function finishEntryDemo() {
  entryComplete = true;
  entryDemo.classList.remove('is-playing', 'is-paused');
  entryDemo.classList.add('is-complete');
}
const entryObserver = new IntersectionObserver(entries => {
  if (entryComplete) return;
  const visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .6;
  entryVisible = visible;
  if (visible && !entryStarted) {
    entryStarted = true;
    entryDemo.classList.add('is-playing');
  }
  entryDemo.classList.toggle('is-paused', !visible || document.hidden);
}, {threshold: [0, .6]});
entryObserver.observe(entryDemo);
entryDemo.querySelector('.entry-text').addEventListener('animationend', () => {
  finishEntryDemo();
  entryObserver.disconnect();
}, {once: true});
reduced.addEventListener('change', () => {
  if (reduced.matches) {finishEntryDemo(); entryObserver.disconnect();}
});
if (reduced.matches) {finishEntryDemo(); entryObserver.disconnect();}

document.addEventListener('visibilitychange', () => {
  if (!entryComplete) entryDemo.classList.toggle('is-paused', !entryVisible || document.hidden);
});

// Cycle the actual app artwork while its card is on screen.
const awardsDemo = document.querySelector('.awards-demo');
const awardPreviews = [...awardsDemo.querySelectorAll('.award-preview')];
let awardIndex = 0;
let awardsVisible = false;
let awardsTimer;
function scheduleAward() {
  clearTimeout(awardsTimer);
  if (!awardsVisible || document.hidden || reduced.matches) return;
  awardsDemo.classList.add('is-running');
  awardsTimer = setTimeout(() => {
    awardPreviews.forEach(item => item.classList.remove('is-leaving'));
    const previous = awardPreviews[awardIndex];
    previous.classList.remove('is-current');
    previous.classList.add('is-leaving');
    awardIndex = (awardIndex + 1) % awardPreviews.length;
    awardPreviews[awardIndex].classList.add('is-current');
    scheduleAward();
  }, 2400);
}
new IntersectionObserver(entries => {
  awardsVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .6;
  scheduleAward();
}, {threshold: [0, .6]}).observe(awardsDemo);
document.addEventListener('visibilitychange', scheduleAward);
reduced.addEventListener('change', scheduleAward);
