// Gotten from bg.js
let state = {
	isActive: true,
	filters: [],
	maxTagLinks: 5,
}

// For counting the number of tags
const tagLink = /[$#][\w]+/gi;

// Timeline HTML container
let container;

// When hiding all elements at once, on a heavily polluted timeline this
// triggers a lot of API calls, sometimes temporarily suspending you.
// This function defers the hiding, giving it more breathing space.
let to = undefined;
const toHide = [];

// Button to still view the post
const _show = document.createElement('button');
_show.textContent = 'Axed';
_show.title = 'Show next axed post';
_show.className = 'show-axed';

// Hide per 10 elements
const hideNext = () => {
	toHide.forEach(el => {
		const _cnt = el.firstChild?.firstChild;
		if(!_cnt?.style) return;
		// Just set opacity to 0. "display: 'none'" unfortunately can come
		// with too many X API requests, throttling you for a while. So just
		// make the posts invisible.
		_cnt.style.visibility = 'hidden';
		const _btn = _show.cloneNode(true);
		_cnt.parentNode.insertBefore(_btn, _cnt);
		_btn.onclick = () => { _cnt.style.visibility = ''; _btn.remove(); el.classList.add('axe-shown'); }
	});
	recountAxed();
	toHide.length = 0;
	to = undefined;
}

// Do a recount of all hidden / shown posts and update the buttons
const recountAxed = () => document.querySelectorAll('div[data-axed]').forEach(el => {
	let numSiblings = 0, s = el;
	do numSiblings++; while((s = s.nextElementSibling) && s.hasAttribute('data-axed'));
	if(numSiblings > 1) el.querySelector('button.show-axed')?.setAttribute('data-num-axed', numSiblings.toString());
});

// Number of axed posts
let axed = 0;

// The main filtering function -- hides posts that match the filters
const filterElements = els => els.map(el => {
	while(el.parentNode && el.parentNode != container) el = el.parentNode;
	return el;
}).filter(el => !!el?.textContent && (!!state.filters.find(f => el.textContent.includes(f))
		|| el.textContent.split('@').slice(1).join('@').split(/[^\s]@/)[0].match(tagLink)?.length > state.maxTagLinks))
	.forEach(el => {
		if(el.hasAttribute('data-axed')) return;
		el.setAttribute('data-axed', (++axed).toString());
		toHide.push(el);
		if(!to) to = setTimeout(hideNext, 20);
	});

// The posts observer
let postObs;

// Get the main timeline HTML element
function getContainer() {
	const _cnt = document.querySelector('[aria-label="Home timeline"] div[style^="position: relative"]');
	if(!state.isActive || _cnt == container || !(container = _cnt)) return;

	// Disconnect any previous watcher
	postObs?.disconnect();

	// Watch for individual posts to filter
	(postObs = new MutationObserver((e) => {
		filterElements(e.reduce((a,r) => { a.push(...(r?.addedNodes ?? [])); return a; }, []));
	})).observe(container, { childList: true, subtree: true });

	// Run filtering already just to be sure
	filterElements(Array.from(container.childNodes));
}

// Hide any sequential hidden post
const style = document.createElement('style');
style.textContent = `button.show-axed {
	display: block;
	font-size: 10px;
	opacity: .25;
	font-family:sans-serif;
	padding: 0 20px;
	margin: 5px auto;
	width:fit-content;
	cursor:pointer;
}
button.show-axed[data-num-axed]::after {
	content: ' (' attr(data-num-axed) ')';
}
div[data-axed]:not(.axe-shown) + div[data-axed] { display: none; }
`;
document.head.appendChild(style);

// Enable/disable
let mainObs = undefined;
function disable() {
	mainObs?.disconnect();
	postObs?.disconnect();
	document.querySelectorAll('div[data-axed]').forEach(el => {
		el.removeAttribute('data-axed');
		const _btn = el.querySelector('button.show-axed');
		_btn.nextElementSibling.style.visibility = '';
		_btn.remove();
	});
	axed = 0;
	container = undefined;
}
function enable() {
	disable();
	mainObs = new MutationObserver(getContainer)
		.observe(document.body, { childList: true, subtree: true });
	getContainer();
}

function setState(s) {
	state = s;
	console.log(`Axe X is now ${state.isActive ? 'active' : 'inactive'}`);
	if(state.isActive) enable();
	else disable();
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener(setState);

// Request the current state when the content script loads
browser.runtime.sendMessage({ action: 'getState' }).then(setState);
