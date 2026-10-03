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
const phrases = ['Вот и поговорили.', 'Есть контакт.', 'Питательный разговор.'];
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
