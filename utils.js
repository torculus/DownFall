/* DownFall – Gnome Shell Extension
 * Copyright (C) 2020 Benjamin S Osenbach
 *
 * Inspired by Let It Snow (https://github.com/offlineric/gsnow).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

const Gio = imports.gi.Gio;
const GioSSS = Gio.SettingsSchemaSource;
const Me = imports.misc.extensionUtils.getCurrentExtension();
 
 function getSettings() {
	let schema = 'org.gnome.shell.extensions.downfall';

	// check if this extension was built with "make zip-file", and thus
	// has the schema files in a subfolder
	// otherwise assume that extension has been installed in the
	// same prefix as gnome-shell (and therefore schemas are available
	// in the standard folders)
	let schemaDir = Me.dir.get_child('schemas');
	let schemaSource;
	if (schemaDir.query_exists(null)) {
		schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
				GioSSS.get_default(),
				false);
	} else {
		schemaSource = GioSSS.get_default();
	}

	let schemaObj = schemaSource.lookup(schema, true);
	if (!schemaObj) {
		throw new Error('Schema ' + schema + ' could not be found for extension ' +
				Me.metadata.uuid + '. Please check your installation.');
	}

	return new Gio.Settings({settings_schema: schemaObj});
}

/**
 * This function was copied from the activities-config extension
 * https://github.com/nls1729/acme-code/tree/master/activities-config
 * by Norman L. Smith.
 */
function cssHexString(css) {
    let rrggbb = '#';
    let start;
    for (let loop = 0; loop < 3; loop++) {
        let end = 0;
        let xx = '';
        for (let loop = 0; loop < 2; loop++) {
            while (true) {
                let x = css.slice(end, end + 1);
                if ((x == '(') || (x == ',') || (x == ')'))
                    break;
                end++;
            }
            if (loop == 0) {
                end++;
                start = end;
            }
        }
        xx = parseInt(css.slice(start, end)).toString(16);
        if (xx.length == 1)
            xx = '0' + xx;
        rrggbb += xx;
        css = css.slice(end);
    }
    return rrggbb;
}

function startEndPoints(direction, monitor, drift, fallItem) {
    let startX;
    let startY;
    let endX;
    let endY;
    
    if (direction == 0) { //Down
        startX = monitor.x + Math.floor(Math.random() * (monitor.width - fallItem.width));
        startY = monitor.y - fallItem.height;
        endX = startX + Math.floor( (2*Math.random()-1) * drift/100 * monitor.width);
        endY = monitor.y + monitor.height - fallItem.height;
        
    } else if (direction == 1) { //Up
        startX = monitor.x + Math.floor(Math.random() * (monitor.width - fallItem.width));
        startY = monitor.y + monitor.height - fallItem.height;
        endX = startX + Math.floor( (2*Math.random()-1) * drift/100 * monitor.width);
        endY = monitor.y - fallItem.height;
        
    } else if (direction == 2) { //Right
        startX = monitor.x - fallItem.width;
        startY = monitor.y + Math.floor(Math.random() * (monitor.height - fallItem.height));
        endX = monitor.x + monitor.width - fallItem.width;
        endY = startY + Math.floor( (2*Math.random()-1) * drift/100 * monitor.height);
        
    } else if (direction == 3) { //Left
        startX = monitor.x + monitor.width - fallItem.width;
        startY = monitor.y + Math.floor(Math.random() * (monitor.height - fallItem.height));
        endX = monitor.x - fallItem.width;
        endY = startY + Math.floor( (2*Math.random()-1) * drift/100 * monitor.height);
        
    } else if (direction == 4) { //Up-Right
        startX = monitor.x + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        startY = monitor.y + monitor.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        endX = monitor.x + monitor.width - fallItem.width + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        endY = monitor.y - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        
    } else if (direction == 5) { //Up-Left
        startX = monitor.x + monitor.width - fallItem.width + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        startY = monitor.y + monitor.height - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        endX = monitor.x + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        endY = monitor.y - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        
    } else if (direction == 6) { //Down-Right
        startX = monitor.x + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        startY = monitor.y - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        endX = monitor.x + monitor.width - fallItem.width + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        endY = monitor.y + monitor.height - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        
    } else { //Down-Left
        startX = monitor.x + monitor.width - fallItem.width + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        startY = monitor.y - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
        endX = monitor.x + Math.floor( (2*Math.random()-1) * drift/200 * monitor.width);
        endY = monitor.y + monitor.height - fallItem.height + Math.floor( (2*Math.random()-1) * drift/200 * monitor.height);
    }
    
    return [startX, startY, endX, endY];
}
