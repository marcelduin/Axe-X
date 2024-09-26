document.addEventListener('DOMContentLoaded', function() {
	const toggleButton = document.getElementById('toggleButton');
	const statusText = document.getElementById('status');
	var filtersTextarea = document.getElementById('filters');
		var hashtagCountInput = document.getElementById('hashtagCount');
	var saveButton = document.getElementById('saveButton');
	
	// Check the current state of the extension
	browser.storage.local.get(['isActive', 'filters', 'maxTagLinks'], function(result) {
		toggleButton.checked = result.isActive || false;
		updateStatus(result.isActive || false);
		filtersTextarea.value = result.filters?.join('\n') || '';
		hashtagCountInput.value = result.maxTagLinks || 0;
	});
	
	toggleButton.addEventListener('change', saveSettings);
	saveButton.addEventListener('click', saveSettings);

	function updateStatus(isActive) {
		statusText.textContent = isActive ? 'Extension is on' : 'Extension is off';
	}

	function saveSettings() {
		const isActive = toggleButton.checked;
		const filters = filtersTextarea.value.split('\n').filter(filter => filter.trim() !== '');
		const maxTagLinks = parseInt(hashtagCountInput.value, 10);

		// Update the status text
		updateStatus(isActive);

		browser.storage.local.set({
			isActive,
			filters,
			maxTagLinks
		}, function() {
			console.log('Settings saved');
			// Notify the background script
			browser.runtime.sendMessage({
				action: 'updateSettings',
				isActive,
				filters,
				maxTagLinks
			});
		});
	}
});
