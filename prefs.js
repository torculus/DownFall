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

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function getSettings() {
	let schema = 'org.gnome.shell.extensions.downfall';

	const GioSSS = Gio.SettingsSchemaSource;

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

function buildPrefsWidget() {
  
  let settings = this.getSettings(Me);
  
  let buildable = new Gtk.Builder();
  
  buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
  
  let prefsWidget = buildable.get_object('prefs_widget');
  
  //bind settings from prefs.xml to schema keys
  settings.bind('falltext' , buildable.get_object('display_field') , 'text' , Gio.SettingsBindFlags.DEFAULT);
  settings.bind('textfont', buildable.get_object('text_font'), 'font', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('monfall', buildable.get_object('monitors_fall'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fallspeed', buildable.get_object('fall_speed'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fallrot', buildable.get_object('fall_rot'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('endeffect', buildable.get_object('end_effect'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falldirec', buildable.get_object('fall_direc'), 'active', Gio.SettingsBindFlags.DEFAULT);
  
  //set color button from settings
  let rgba = new Gdk.RGBA();
  rgba.parse(settings.get_string('textcolor'));
  buildable.get_object('text_color').set_rgba(rgba);
  
  //bind text color to key
  buildable.get_object('text_color').connect('notify::rgba', (button) => {
            let rgba1 = button.get_rgba();
            let hexString = cssHexString(rgba1.to_string());
            settings.set_string('textcolor', hexString);
        });
  
  
  prefsWidget.show_all();
  return prefsWidget;
}

function init() {
}


