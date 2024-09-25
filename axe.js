// Words, phrases, can include linked domains to be filtered
// @X: why the heck haven't you banned these domains yet
// TODO: make this configurable in this extension
const filters = [
	'ripplereward-official.net',
	'safe-signals.net',
];

// For counting the number of tags
const tagLink = /[$#][\w]+/gi;

// Maximum number of tag links (#/$...) per post
// TODO: make this configurable in this extension
const maxTagLinks = 5;

// Timeline HTML container
let container;

// When hiding all elements at once, on a heavily polluted timeline this
// triggers a lot of API calls, sometimes temporarily suspending you.
// This function defers the hiding, giving it more breathing space.
let to = undefined;
const toHide = [];

// Button to still view the post
const _show = document.createElement('button');
_show.textContent = 'Axed. Show this post.';
_show.setAttribute('style', 'display: block; font-size: 10px; opacity: .25;font-family:sans-serif;padding: 0 20px;margin: 5px auto;width:fit-content;cursor:pointer;');

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
		_btn.onclick = () => { _cnt.style.visibility = ''; _btn.remove(); }
	});
	toHide.length = 0;
	to = undefined;
}

// Number of axed posts
let axed = 0;

// The main filtering function -- hides posts that match the filters
const filterElements = els => els.map(el => {
	while(el.parentNode && el.parentNode != container) el = el.parentNode;
	return el;
}).filter(el => !!el?.textContent && (!!filters.find(f => el.textContent.includes(f))
		|| el.textContent.match(tagLink)?.length > maxTagLinks))
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
	if(_cnt == container || !(container = _cnt)) return;

	// Disconnect any previous watcher
	postObs?.disconnect();

	// Watch for individual posts to filter
	(postObs = new MutationObserver((e) => {
		filterElements(e.reduce((a,r) => { a.push(...(r?.addedNodes ?? [])); return a; }, []));
	})).observe(container, { childList: true, subtree: true });

	// Run filtering already just to be sure
	filterElements(Array.from(container.childNodes));
}

// Run when the page loads
getContainer();

// Initial runtime
(() => new MutationObserver(getContainer)
	.observe(document.body, { childList: true, subtree: true })
)();
