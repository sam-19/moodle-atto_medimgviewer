YUI.add('moodle-atto_medimgviewer-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/** MEDICAL IMAGING STUDY VIEWER ATTO EDITOR PLUGIN
 * @package    medimg-viewer
 * @copyright  2021-2022 Sampsa Lohi & University of Eastern Finland
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *
 * @module moodle-atto-medimgviewer-button
 *
 * @namespace M.atto_link
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_medimgviewer',
    CSS = { },
    LOGNAME = 'atto_medimgviewer',
    SELECTORS = { },
    STYLES = {
        BROWSER: "height: 600px; width: 600px; overflow: auto; padding: 5px;",
        CONTROLS: "wdith: 100px; padding: 10px; float: left;",
        LINK: "cursor: pointer; color: #1177d1;",
        PATH: "width: 500px; padding: 10px; border: 1px solid rgba(0, 0, 0, .125); margin-bottom: 10px; white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis; float: left;",
        PLACEHOLDER: "font-style: italic; opacity: 0.75;",
    },
    TEMPLATE = '{{#if showFilepicker}}' +
        '<div id="medimg-viewer-editor">' +
            '<div id="medimg-viewer-editor-path">' +
                '<div id="medimg-viewer-editor-path-display" style="' + STYLES.PATH + '">' +
                    '<span style="' + STYLES.PLACEHOLDER + '">{{get_string "dialog:select_file" component}}</span>' +
                '</div>' +
                '<div id="medimg-viewer-editor-path-controls" style="' + STYLES.CONTROLS + '">' +
                    '<span id="medimg-viewer-editor-copy" style="' + STYLES.LINK + '">{{get_string "dialog:copy" component}}</span> / ' +
                    '<span id="medimg-viewer-editor-insert" style="' + STYLES.LINK + '">{{get_string "dialog:insert" component}}</span>' +
                '</div>' +
            '</div>' +
            '<textarea id="medimg-viewer-editor-path-copy" style="display:none"></textarea>' +
            '<div id="medimg-viewer-editor-file-browser" style="' + STYLES.BROWSER + '" data-path="/">{{get_string "dialog:loading" component}}</div>' +
        '</div>' +
    '{{/if}}';

Y.namespace('M.atto_medimgviewer').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,
    /**
     * A reference to the dialogue content.
     *
     * @property _content
     * @type Node
     * @private
     */
    _content: null,

    initializer: function() {
        if (this.get('disabled')) {
            return;
        }
        var host = this.get('host'),
            area = this.get('area'),
            options = host.get('filepickeroptions');
        if (!area || !area.filtertag) {
            return;
        }
        if (options.image && options.image.itemid) {
            area.itemid = options.image.itemid;
        } else {
            return;
        }
        this.addButton({
            icon: 'icon-final',
            iconComponent: 'atto_medimgviewer',
            callback: this._displayBrowser
        });
    },
    /**
     * Build the file area file tree.
     * @param {object} dir
     * @returns void
     */
    _buildFileTree: function () {
        var args = Y.mix(
                this.get('area'),
                { what: 'filetree' }
            ),
            url = M.cfg.wwwroot + '/lib/editor/atto/plugins/medimgviewer/api.php?' + Y.QueryString.stringify(args);
        // Fetch current file tree from the API and display it
        fetch(url).then(function (response) { console.log(response); return response.json() }).then(function (data) {
            var fileBrowser = document.getElementById('medimg-viewer-editor-file-browser'),
                pathCopy = document.getElementById('medimg-viewer-editor-path-copy'),
                pathDisplay = document.getElementById('medimg-viewer-editor-path-display');
            if ($.isEmptyObject(data.subdirs) && !data.files.length) {
                // File area is empty
                fileBrowser.innerText = M.util.get_string('dialog:no_files', 'atto_medimgviewer');
                return;
            }
            fileBrowser.innerText = ''; // Clear please wait message
            var parseDir = function (dir, level, path) {
                if (!dir) {
                    return;
                }
                var file, key, row, subdir, content, icon, indent,
                    applyIndent = function (el, amount) {
                        for (var i=0; i<amount; i++) {
                            indent = document.createElement('span');
                            indent.style.display = "inline-block";
                            indent.style.width = "calc(16px + 0.5rem)";
                            el.appendChild(indent);
                        }
                    },
                    toggleDirectory = function (dirPath) {
                        var isOpen;
                        document.querySelector("#medimg-viewer-editor-file-browser")
                        .childNodes.forEach(function (child) {
                            // This operation must be run twice
                            if (child.dataset.path && child.dataset.path === dirPath) {
                                if (parseInt(child.dataset.open)) {
                                    isOpen = true;
                                } else {
                                    isOpen = false;
                                }
                                child.dataset.open = isOpen ? 0 : 1;
                                return;
                            }
                        })
                        document.querySelector("#medimg-viewer-editor-file-browser")
                        .childNodes.forEach(function (child) {
                            if (child.dataset.path) {
                                const curPath = child.dataset.path;
                                if (curPath.startsWith(dirPath) && curPath.length > dirPath.length) {
                                    if (curPath.substring(dirPath.length, curPath.length - 1).indexOf('/') === -1) {
                                        // Node is either a subdirectory or file inside the given dir
                                        if (isOpen) {
                                            child.style.height = '0';
                                            if (child.dataset.open !== undefined) {
                                                child.dataset.open = 0;
                                            }
                                        } else {
                                            child.style.height = '1.5em';
                                        }
                                    } else if (isOpen) {
                                        // Close also all items in deeper subdirectories
                                        child.style.height = '0';
                                    }
                                }
                            }
                        })
                    };
                for (file in dir.files) {
                    // Shifter's default linter won't allow const, so the linter must be disabled
                    const filePath = path + file;
                    row = document.createElement('div');
                    row.style.height = level ? '0' : '1.5em'; // Display root items, hide others
                    row.style.lineHeight = '1.5em';
                    row.style.cursor = 'pointer';
                    row.style.overflow = 'hidden';
                    row.dataset.path = filePath;
                    row.onclick = function () {
                        pathDisplay.innerText = filePath;
                        pathCopy.value = filePath;
                    }
                    applyIndent(row, level);
                    icon = document.createElement('i');
                    icon.className = 'icon fa fa-file-o fa-fw';
                    row.appendChild(icon);
                    content = document.createElement('span');
                    content.innerText = file;
                    row.appendChild(content);
                    fileBrowser.appendChild(row);
                }
                for (key in dir.subdirs) {
                    subdir = dir.subdirs[key];
                    const dirPath = path + key + '/';
                    row = document.createElement('div');
                    row.style.height = level ? '0' : '1.5em';
                    row.style.lineHeight = '1.5em';
                    row.style.cursor = 'pointer';
                    row.style.overflow = 'hidden';
                    row.dataset.path = dirPath;
                    row.dataset.open = 0;
                    row.onclick = function () {
                        pathDisplay.innerText = dirPath;
                        pathCopy.value = dirPath;
                    }
                    row.ondblclick = function () {
                        toggleDirectory(dirPath);
                    }
                    applyIndent(row, level);
                    icon = document.createElement('i');
                    icon.className = 'icon fa fa-folder fa-fw';
                    icon.style.color = '#1177d1';
                    row.appendChild(icon);
                    content = document.createElement('span');
                    content.style.userSelect = 'none'; // Prevent text highlighting on double-click
                    content.innerText = key;
                    row.appendChild(content);
                    fileBrowser.appendChild(row);
                    parseDir(subdir, level + 1, dirPath);
                }
            }
            parseDir(data, 0, '/');
        });
    },
    _copyPathToClipboard: function (e) {
        var pathEl = document.getElementById('medimg-viewer-editor-path-copy'),
            area = this.get('area');
        if (!pathEl.value) {
            console.warn('Path is empty, nothing to copy.');
            return;
        }
        const filePath = M.cfg.wwwroot +
                        '/draftfile.php/' + area.usercontextid + '/user/draft/' + area.itemid +
                        pathEl.value + ':' + area.filtertag;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(filePath).then(function() {
                console.log('Path copied to clipboard.');
            }, function(err) {
                console.error('Copying path to clipboard failed!', err);
            })
            return;
        }
        // Try to use fallback
        const orig = pathEl.value;
        pathEl.value = filePath;
        pathEl.focus();
        pathEl.select();
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                console.log('Path copied to clipboard.');
            } else {
                console.error('Copying path to clipboard failed!');
            }
        } catch (err) {
            console.error('Copying path to clipboard failed!', err);
        }
        pathEl.value = orig;
        pathEl.blur();
    },
    /**
     * Display file area browser.
     *
     * @method _displayBrowser
     * @private
     */
    _displayBrowser: function(e) {
        e.preventDefault();
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }
        var dialogue = this.getDialogue({
                headerContent: M.util.get_string('medimgviewer', LOGNAME),
                width: 'auto',
                focusAfterHide: true
            });
        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent());
        // Resolve anchors in the selected text.
        this._resolveAnchors();
        dialogue.show();
        this._buildFileTree()
            //iframe = Y.Node.create('<iframe name="medimgviewerdialog"></iframe>');
        // We set the height here because otherwise it is really small. That might not look
        // very nice on mobile devices, but we considered that enough for now.
        //iframe.setStyles({
        //    height: '700px',
        //    border: 'none',
        //    width: '100%'
        //});
        //iframe.setAttribute('src', this._getBrowserURL());
        //console.log(iframe);
        //dialogue.set('bodyContent', iframe).show();
        //window.medimgviewerdialog.insertLinkCallback = this._setLinkOnSelection;
        //window.medimgviewerdialog.parentInstance = this;
        //this.markUpdated();
    },
    /**
     * Generates the content of the dialogue.
     *
     * @method _getDialogueContent
     * @return {Node} Node containing the dialogue content
     * @private
     */
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE),
            canShowFilepicker = this.get('host').canShowFilepicker('link'), // TODO: A dedicated parameter for medimg?
            compiled;
        compiled = template({
            showFilepicker: canShowFilepicker,
            component: COMPONENTNAME,
            CSS: CSS,
            filetree: this.get('filetree'),
            itemid: this.get('itemid'),
        })
        this._content = Y.Node.create(compiled);
        this._content.one('#medimg-viewer-editor-copy').on('click', this._copyPathToClipboard, this);
        this._content.one('#medimg-viewer-editor-insert').on('click', this._setLinkOnSelection, this);
        //if (canShowFilepicker) {
            // Populate the file tree
        //}
        return this._content;
    },
    /**
     * If there is selected text and it is part of an anchor link,
     * extract the url (and target) from the link (and set them in the form).
     *
     * @method _resolveAnchors
     * @private
     */
    _resolveAnchors: function() {
        // Find the first anchor tag in the selection.
        var selectednode = this.get('host').getSelectionParentNode(),
            anchornodes,
            anchornode,
            url;
        // Note this is a document fragment and YUI doesn't like them.
        if (!selectednode) {
            return;
        }
        anchornodes = this._findSelectedAnchors(Y.one(selectednode));
        if (anchornodes.length > 0) {
            anchornode = anchornodes[0];
            this._currentSelection = this.get('host').getSelectionFromNode(anchornode);
            url = anchornode.getAttribute('href');
            if (url !== '') {
                this._content.one('#medimg-viewer-editor-path-display').innerText = url;
            }
        }
    },
    // Below methods have been taken pretty much directly from the Atto Link plugin (c) Damyon Wiese
    /**
     * Final step setting the anchor on the selection.
     *
     * @private
     * @method _setLinkOnSelection
     * @param  {String} url URL the link will point to.
     * @return {Node} The added Node.
     */
    _setLinkOnSelection: function () {
        // NOTE! This method raises an error ("Maximum call stack exceeded."), which should be resolved
        // in the near future: https://tracker.moodle.org/browse/MDL-69292
        var host = this.get('host'),
            area = this.get('area'),
            url = M.cfg.wwwroot +
                  '/draftfile.php/' + area.usercontextid + '/user/draft/' + area.itemid +
                  document.getElementById('medimg-viewer-editor-path-display').innerText +
                  ':' + area.filtertag,
            link,
            selectednode,
            anchornodes;
        this.editor.focus();
        host.setSelection(this._currentSelection);
        if (this._currentSelection[0].collapsed) {
            // Firefox cannot add links when the selection is empty so we will add it manually.
            link = Y.Node.create('<a>' + url + '</a>');
            link.setAttribute('href', url);
            // Add the node and select it to replicate the behaviour of execCommand.
            selectednode = host.insertContentAtFocusPoint(link.get('outerHTML'));
            host.setSelection(host.getSelectionFromNode(selectednode));
        } else {
            document.execCommand('unlink', false, null);
            document.execCommand('createLink', false, url);
            // Now set the target.
            selectednode = host.getSelectionParentNode();
        }
        // Note this is a document fragment and YUI doesn't like them.
        if (!selectednode) {
            return;
        }
        anchornodes = this._findSelectedAnchors(Y.one(selectednode));
        return selectednode;
    },

    /**
     * Look up and down for the nearest anchor tags that are least partly contained in the selection.
     *
     * @method _findSelectedAnchors
     * @param {Node} node The node to search under for the selected anchor.
     * @return {Node|Boolean} The Node, or false if not found.
     * @private
     */
    _findSelectedAnchors: function (node) {
        var tagname = node.get('tagName'),
            hit, hits;
        // Direct hit.
        if (tagname && tagname.toLowerCase() === 'a') {
            return [node];
        }
        // Search down but check that each node is part of the selection.
        hits = [];
        node.all('a').each(function(n) {
            if (!hit && this.get('host').selectionContainsNode(n)) {
                hits.push(n);
            }
        }, this);
        if (hits.length > 0) {
            return hits;
        }
        // Search up.
        hit = node.ancestor('a');
        if (hit) {
            return [hit];
        }
        return [];
    }
}, {
    ATTRS: {
        area: {
            value: {}
        },
        disabled: {
            value: false
        },
        usercontext: {
            value: null
        }
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
