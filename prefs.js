/* DownFall – Gnome Shell Extension
 * Copyright (C) 2019-2021 Benjamin S Osenbach
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
const Utils = Me.imports.utils;
const Config = imports.misc.config;

function buildPrefsWidget() {
  
  let settings = Utils.getSettings();
  
  let buildable = new Gtk.Builder();
  
  if ( Config.PACKAGE_VERSION.startsWith("4") ) { //running GNOME 40 or higher
    buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
  } else {
    buildable.add_from_file(Me.dir.get_path() + '/prefs_legacy.xml');
  }
  
  let prefsWidget = buildable.get_object('prefs_widget');
  
  //bind settings from prefs.xml to schema keys
  settings.bind('textfont', buildable.get_object('text_font'), 'font', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('matrixtrails', buildable.get_object('matrix_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fireworks', buildable.get_object('firework_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fallmon', buildable.get_object('fall_monitor'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falldirec', buildable.get_object('fall_direc'), 'active', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('maxchars', buildable.get_object('max_chars'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falltime', buildable.get_object('fall_time'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('fallrot', buildable.get_object('fall_rot'), 'value', Gio.SettingsBindFlags.DEFAULT);
  settings.bind('falldrift', buildable.get_object('fall_drift'), 'value', Gio.SettingsBindFlags.DEFAULT);
  
  //set display_field from key
  let dispfield = settings.get_strv('falltext');
  let disptext = dispfield.toString();
  buildable.get_object('display_field').set_text(disptext);
  
  //bind display_field to key
  buildable.get_object('display_field').connect('notify::text', (entry) => {
  	let typed = entry.get_text();
  	let falltext = typed.split(',');
  	settings.set_strv('falltext', falltext);
  });
  
  //set color button from settings
  let rgba = new Gdk.RGBA();
  rgba.parse(settings.get_string('textcolor'));
  buildable.get_object('text_color').set_rgba(rgba);
  
  //bind text color to key
  buildable.get_object('text_color').connect('notify::rgba', (button) => {
            let rgba1 = button.get_rgba();
            let hexString = Utils.cssHexString(rgba1.to_string());
            settings.set_string('textcolor', hexString);
        });
  
  if ( Config.PACKAGE_VERSION.startsWith("3.") ) { //running GNOME 3.36/3.38
    prefsWidget.show_all();
  }
  return prefsWidget;
}

function init() {
}


