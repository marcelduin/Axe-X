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

// The main filtering function -- hides posts that match the filters
const filterElements = els => els.map(el => {
	while(el.parentNode && el.parentNode != container) el = el.parentNode;
	return el;
}).filter(el => !!el?.textContent && (!!filters.find(f => el.textContent.includes(f))
		|| el.textContent.match(tagLink)?.length > maxTagLinks))
	.forEach(el => el.style.display = 'none');

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
