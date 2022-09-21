<?php
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
 */

require(__DIR__ . '/../../../../../config.php');
require_once($CFG->libdir . '/filestorage/file_storage.php');
require_once($CFG->dirroot . '/repository/lib.php');

$itemid = required_param('itemid', PARAM_INT);
$maxbytes = optional_param('maxbytes', 0, PARAM_INT);
$areamaxbytes = optional_param('areamaxbytes', FILE_AREA_MAX_BYTES_UNLIMITED, PARAM_INT);
$contextid = optional_param('context', SYSCONTEXTID, PARAM_INT);
$component = optional_param('component', '', PARAM_TEXT);
$elementid = optional_param('elementid', '', PARAM_TEXT);

$context = context::instance_by_id($contextid);
$usercontext = context_user::instance($USER->id);
if ($context->contextlevel == CONTEXT_MODULE) {
    // Module context.
    $cm = $DB->get_record('course_modules', array('id' => $context->instanceid));
    require_login($cm->course, true, $cm);
} else if (($coursecontext = $context->get_course_context(false)) && $coursecontext->id != SITEID) {
    // Course context or block inside the course.
    require_login($coursecontext->instanceid);
    $PAGE->set_context($context);
} else {
    // Block that is not inside the course, user or system context.
    require_login();
    $PAGE->set_context($context);
}
// Guests cannot manage resources
if (isguestuser()) {
    print_error('noguest');
}
// Get area file tree
$filetree = get_file_storage()->get_area_tree($usercontext->id, 'user', 'draft', $itemid);
$title = get_string('dialog:title', 'atto_medimgviewer');

$PAGE->set_url('/lib/editor/atto/plugins/medimgviewer/browser.php');
$PAGE->set_title($title);
$PAGE->set_heading($title);
$PAGE->set_pagelayout('popup');

echo $OUTPUT->header();
$filetree = htmlspecialchars(json_encode($filetree));
?>

<div style="display:none" id="medimg-viewer-atto-plugin-filetree"><?php echo $filetree; ?></div>
<div style="display:none" id="medimg-viewer-atto-plugin-filearea"><?php echo $CFG->wwwroot . '/draftfile.php/' . $usercontext->id . '/user/draft/' . $itemid; ?></div>

<div id="medimg-viewer-atto-plugin-path">
    <div id="medimg-viewer-atto-plugin-path-display">
        <span><?php echo get_string('dialog:select_file', 'atto_medimgviewer'); ?></span>
    </div>
    <div id="medimg-viewer-atto-plugin-path-controls">
        <span onclick="medimgViewerCopy()"><?php echo get_string('dialog:copy', 'atto_medimgviewer') ?></span> /
        <span onclick="medimgViewerInsert()"><?php echo get_string('dialog:insert', 'atto_medimgviewer'); ?></span>
    </div>
</div>

<div id="medimg-viewer-atto-plugin-file-browser"></div>

<script type="text/javascript">

// Load file area tree
const fileTree = JSON.parse(document.getElementById('medimg-viewer-atto-plugin-filetree').innerText)
const fileBrowser = document.getElementById('medimg-viewer-atto-plugin-file-browser')
const pathDisplay = document.getElementById('medimg-viewer-atto-plugin-path-display')
const fileareaPath = document.getElementById('medimg-viewer-atto-plugin-filearea').innerText
const suffix = '#medimg-viewer-resource'
const dirClass = 'medimg-viewer-atto-plugin-dir-row'
const fileClass = 'medimg-viewer-atto-plugin-file-row'
const indentClass = 'medimg-viewer-atto-plugin-level-indent'
let firstSelected = false
const parseDir = (dir, level, path) => {
    if (!dir) {
        return
    }
    const applyIndent = (el, amount) => {
        for (let i=0; i<amount; i++) {
            const indent = document.createElement('span')
            indent.className = indentClass
            el.appendChild(indent)
        }
    }
    for (file in dir.files) {
        const realPath = path + file
        const row = document.createElement('div')
        row.className = fileClass
        row.onclick = ()  => {
            firstSelected = true
            pathDisplay.innerText = realPath
        }
        applyIndent(row, level)
        const icon = document.createElement('i')
        icon.className = 'icon fa fa-file-o fa-fw'
        row.appendChild(icon)
        const content = document.createElement('span')
        content.innerText = file
        row.appendChild(content)
        fileBrowser.appendChild(row)
    }
    for ([name, subdir] of Object.entries(dir.subdirs)) {
        const realPath = path + name + '/'
        const row = document.createElement('div')
        row.className = dirClass
        row.onclick = ()  => {
            firstSelected = true
            pathDisplay.innerText = realPath
        }
        applyIndent(row, level)
        const icon = document.createElement('i')
        icon.className = 'icon fa fa-folder fa-fw'
        icon.style.color = '#1177d1'
        row.appendChild(icon)
        const content = document.createElement('span')
        content.innerText = name
        row.appendChild(content)
        fileBrowser.appendChild(row)
        parseDir(subdir, level + 1, realPath)
    }
}
parseDir(fileTree, 0, '/')
const medimgViewerCopy = () => {
    if (!firstSelected) {
        return
    }
    console.log("copy", fileareaPath + pathDisplay.innerText + suffix)
}
const medimgViewerInsert = () => {
    if (!firstSelected) {
        return
    }
    window.insertLinkCallback(fileareaPath + pathDisplay.innerText + suffix)
}

</script>

<style>
.medimg-viewer-atto-plugin-dir-row,
.medimg-viewer-atto-plugin-file-row {
    cursor: pointer;
}
#medimg-viewer-atto-plugin-path {
    position: absolute;
    top: -50px;
    left: 15px;
    width: calc(100% - 30px);
    padding: 10px;
    border: 1px solid rgba(0, 0, 0, .125);
    margin-bottom: 10px;
}
#medimg-viewer-atto-plugin-file-browser {
    height: 590px;
    overflow: auto;
}
    #medimg-viewer-atto-plugin-path-display > span {
        font-style: italic;
        opacity: 0.75;
    }
    #medimg-viewer-atto-plugin-path-controls {
        position: absolute;
        top: 10px;
        right: 10px;
    }
        #medimg-viewer-atto-plugin-path-controls > span {
            cursor: pointer;
            color: #1177d1;
        }
span.medimg-viewer-atto-plugin-level-indent {
    display: inline-block;
    width: calc(16px + 0.5rem);
}
</style>

<?php
echo $OUTPUT->footer();
