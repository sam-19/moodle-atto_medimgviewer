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
 * @package    atto_medimgviewer
 * @copyright  2021-2023 Sampsa Lohi & University of Eastern Finland
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Initialise the strings required for JS.
 * @return void
 */
function atto_medimgviewer_strings_for_js() {
    global $PAGE;
    $PAGE->requires->strings_for_js(array('medimgviewer',
                                          'dialog:select_file',
                                          'dialog:insert',
                                          'dialog:copy',
                                    ),
                                    'atto_medimgviewer');
}

/**
 * Return the js params required for this module.
 * @param string $elementid
 * @param array $options
 * @param array $fpoptions
 * @return array of additional params to pass to javascript init function for this module.
 */
function atto_medimgviewer_params_for_js($elementid, $options, $fpoptions) {
    global $CFG, $USER;
    require_once($CFG->libdir . '/filestorage/file_storage.php');
    require_once($CFG->dirroot . '/repository/lib.php');  // Load constants.
    $filtertag = get_config('filter_medimgviewer', 'filtertag');
    if (empty($filtertag)) {
        // MedImg Viewer filter is not set up.
        return null;
    }
    $usercontext = context_user::instance($USER->id);
    $params['area']['usercontextid'] = $usercontext->id;
    $params['area']['filtertag'] = $filtertag;
    foreach ($options as $key => $value) {
        if ($key === 'context' && is_object($options[$key])) {
            // Just context id is enough.
            $params['area'][$key] = $value->id;
        } else {
            $params['area'][$key] = $value;
        }
    }
    return $params;
}
