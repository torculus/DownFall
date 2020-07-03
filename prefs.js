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

function buildPrefsWidget() {
  let buildable = new Gtk.Builder();
  
  buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
  
  let prefsWidget = buildable.get_object('prefs_widget');
  
  //settings.bind('speed', buildable.get_object(), 'value', Gio.SettingsBindFlags.DEFAULT);
  
  prefsWidget.show_all();
  return prefsWidget;
}

function init() {
    //
}
