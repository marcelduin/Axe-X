let isActive = false;

// Words, phrases, can include linked domains to be filtered
let filters = []

// Maximum number of tag links (#/$...) per post
let maxTagLinks = 5;

// Initialize the extension state
browser.storage.local.get(['isActive', 'filters', 'maxTagLinks'], function(result) {
	isActive = result.isActive !== undefined ? result.isActive : true;
	filters = result.filters || [
		// @X: why the heck haven't you banned these domains yet
		'ripplereward-official.net',
		'safe-signals.net',

		// Regular text filters work as well
		'new alerts have been posted in the last hours',
		'is set and ready for a run up',
	];
	maxTagLinks = result.maxTagLinks || 5;
	browser.storage.local.set({isActive, filters, maxTagLinks});
	handleExtensionState();
});
	
// Listen for messages from the popup
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.action) {
		// From the settings popup
		case 'updateSettings':
			isActive = message.isActive;
			filters = message.filters;
			maxTagLinks = message.maxTagLinks;
			handleExtensionState();
			break;
		// From the content JS
		case 'getState':
			sendResponse({isActive, filters, maxTagLinks});
			break;
	}
});
	
function handleExtensionState() {
	// Update the extension icon to reflect the current state
	browser.browserAction.setIcon({
		path: isActive ? "icon.svg" : "icon-inactive.svg"
	});

	// Notify all content scripts
	browser.tabs.query({}, function(tabs) {
		for (let tab of tabs) {
			browser.tabs.sendMessage(tab.id, {
				action: "updateState",
				isActive, filters, maxTagLinks
			}).catch(() => {
				// Ignore errors for tabs where content script is not running
			});
		}
	});
}
