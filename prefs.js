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

function buildPrefsWidget() {
  
  let settings = this.getSettings(Me);
  
  let buildable = new Gtk.Builder();
  
  buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
  
  let prefsWidget = buildable.get_object('prefs_widget');
  
  //settings.bind('GSCHEMA.XML THING' , buildable.get_object('PREFS.XML THING') , 'value' , Gio.SettingsBindFlags.DEFAULT);
  settings.bind('characters' , buildable.get_object('characters') , 'value' , Gio.SettingsBindFlags.DEFAULT);
  
	/* Bind fields to settings
	settings.bind('check-interval' , buildable.get_object('field_interval') , 'value' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('always-visible' , buildable.get_object('field_visible') , 'active' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('show-count' , buildable.get_object('field_count') , 'active', Gio.SettingsBindFlags.DEFAULT);
	settings.bind('notify' , buildable.get_object('field_notify') , 'active' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('howmuch', buildable.get_object('field_howmuch'), 'active', Gio.SettingsBindFlags.DEFAULT);
	settings.bind('transient', buildable.get_object('field_transient'), 'active', Gio.SettingsBindFlags.DEFAULT);
	settings.bind('strip-versions' , buildable.get_object('field_stripversions') , 'active' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('check-cmd' , buildable.get_object('field_checkcmd') , 'text' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('update-cmd' , buildable.get_object('field_updatecmd') , 'text' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('pacman-dir' , buildable.get_object('field_pacmandir') , 'text' , Gio.SettingsBindFlags.DEFAULT);
	settings.bind('auto-expand-list', buildable.get_object('field_autoexpandlist'), 'value', Gio.SettingsBindFlags.DEFAULT);
	settings.bind('package-manager' , buildable.get_object('field_packagemanager') , 'text' , Gio.SettingsBindFlags.DEFAULT);*/
  
  prefsWidget.show_all();
  return prefsWidget;
}

function init() {
}


