document.addEventListener('DOMContentLoaded', function() {
	const toggleButton = document.getElementById('toggleButton');
	const statusText = document.getElementById('status');
	
	// Check the current state of the extension
	browser.storage.local.get('isActive', function(result) {
		toggleButton.checked = result.isActive || false;
		updateStatus(result.isActive || false);
	});
	
	toggleButton.addEventListener('change', function() {
		var isActive = toggleButton.checked;
		
		// Save the state
		browser.storage.local.set({isActive});
		
		// Update the status text
		updateStatus(isActive);
		
		// Notify the background script
		browser.runtime.sendMessage({action: 'toggleExtension', isActive});
	});
	
	function updateStatus(isActive) {
		statusText.textContent = isActive ? 'Extension is on' : 'Extension is off';
	}
});
