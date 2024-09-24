# Axe X: remove unwanted posts from your X feeds

X might be pretty good, but their spam filters still are **SHIT** (writing in 2024). There are many huge botfarms posting the same crypto spam over and over from 1000s of different dormant, hacked accounts.

After personally doing 1000s of post reports and many times asking them to please fix this on their end, to no avail, my frustration has created this Firefox extension which removes all posts based on your own filters from the HTML, saving your own eyes and brain some strenuous time.

@X: GET YOUR SPAM SHIT TOGETHER. PLEASE.

### First version

This release is a first version, or almost a PoC, with hard-coded linked URLs and maximum of 5 tag-links per post which will be filtered out.

### Possible issues

If you have a heavily polluted timeline, you will see some visual hiccups and a lot of server loads. Maybe eventually even resulting in some loading errors for doing too many requests in a small time frame. But that's only temporary -- reload after a while to fix this.

## Reason

I want X to have better spam and botfarm detection and filtering. It's not that hard (quote me on this). It will save users so much frustration with the platform.

This Firefox extension is a glimpse of how it _could be_.

## Running it locally

Firefox Extension development is not very trivial, and there's a big difference between dev mode and local / prod mode.

### For local development

Load the extension in Firefox:

* Go to `about:debugging`
* Click "This Firefox"
* Click "Load Temporary Add-on"
* Select the `manifest.json` file in this extension directory

This only works in your current browser session and is forgotten after you close your browser.

### Running your local extension persistently

Even to run this extension locally, you need to have your own Mozilla API key, and the `web-ext` tool. See more info here: https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/

Once you've done that, you can do:

	* `web-ext build` to build your extension, be sure to increase your version after each signing.
	* `web-ext sign --channel=unlisted` to sign and compile to an `.xpi` file which can be directly loaded into Firefox, but not published to the listed Firefox extension store. Use `--channel=listed` for public channels.
