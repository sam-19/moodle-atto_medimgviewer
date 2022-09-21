# Moodle Atto editor plugin for [Medical Imaging Study Viewer](https://github.com/sam-19/medical-imaging-viewer)

## Usage

After installing the plugin, add `medimgviewer` to the `files` row (or a button group of your choice) in `Administration / Plugins / Text editors / Atto HTML editor / Toolbar config`.

Clicking the app icon on the editor toolbar opens up a modal displaying the files and folders in the root directory of the file area. **Clicking** on a file or folder will copy its path to the _path row_ above, while **double-clicking** folders will display their contents.

Inserting the viewer in the text editor does not work in a WYSIWYG manner, because the viewer would be much too large to comfortably handle in the editor. Instead, a formatted link can be inserted into the text content, which will then (when viewing the entry) be replaced by the viewer app, opening the linked resource.

Once a path to a resource (file or folder) is shown on the top row, inserting the link can be done in two ways:
* Clicking `Copy` will copy a formatted URL to that resource to clipboard, which can be pasted as a link into the text.
* Clicking `Insert` will insert a complete link at the cursor position, or if text has been selected, will wrap that text in a formatted link to the resource.

Removing the viewer app is done by removing the formatted link from the text.

## Additional notes

This repository includes the compiled JavaScript files and is usable as-is.
