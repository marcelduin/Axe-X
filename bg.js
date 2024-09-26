let isActive = false;

// Words, phrases, can include linked domains to be filtered
let filters = [
	// @X: why the heck haven't you banned these domains yet
	'ripplereward-official.net',
	'safe-signals.net',

	// Regular text filters work as well
	'new alerts have been posted in the last hours',
	'is set and ready for a run up',
];

// Maximum number of tag links (#/$...) per post
let maxTagLinks = 5;


// Initialize the extension state
browser.storage.local.get('isActive', function(result) {
	isActive = result.isActive !== undefined ? result.isActive : true;
	browser.storage.local.set({isActive});
});
	
// Listen for messages from the popup
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.action) {
		case 'toggleExtension':
			handleExtensionState(message.isActive);
			break;
		case 'getState':
			sendResponse({isActive, filters, maxTagLinks});
			break;
	}
});
	
function handleExtensionState(isActive) {
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

// Check the extension state on startup
browser.storage.local.get('isActive', function(result) {
	handleExtensionState(isActive = result.isActive !== undefined ? result.isActive : true);
});
