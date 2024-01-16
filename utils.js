/* DownFall – Gnome Shell Extension
 * Copyright (C) 2019-2024 Benjamin S Osenbach
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

import GLib from 'gi://GLib';

function startEndPoints(direction, monitor, avgdrift, fallItem) {
    let startX;
    let startY;
    let endX;
    let endY;

    let aw = Math.floor(avgdrift * monitor.width);
    let ah = Math.floor(avgdrift * monitor.height);
    
    if (direction > 4) {
    	var aw_2 = Math.floor(aw/2);
    	var ah_2 = Math.floor(ah/2);
    }

    switch (direction) {
      case 0: //Down
        startX = GLib.random_int_range(monitor.x, monitor.x + monitor.width);
        startY = monitor.y;
        endX = startX + GLib.random_int_range(-aw, aw);
        endY = monitor.y + monitor.height;
	break;
      case 1: //Up
        startX = GLib.random_int_range(monitor.x, monitor.x + monitor.width);
        startY = monitor.y + monitor.height;
        endX = startX + GLib.random_int_range(-aw, aw);
        endY = monitor.y - fallItem.height;
	break;
      case 2: //Right
        startX = monitor.x;
        startY = GLib.random_int_range(monitor.y, monitor.y + monitor.height);
        endX = monitor.x + monitor.width;
        endY = startY + GLib.random_int_range(-ah, ah);
	break;
      case 3: //Left
        startX = monitor.x + monitor.width;
        startY = GLib.random_int_range(monitor.y, monitor.y + monitor.height);
        endX = monitor.x - fallItem.width;
        endY = startY + GLib.random_int_range(-ah, ah);
	break;
      case 4: //Up-Right
        startX = monitor.x + GLib.random_int_range(-aw_2, aw_2);
        startY = monitor.y + monitor.height + GLib.random_int_range(-ah_2, ah_2);
        endX = monitor.x + monitor.width + GLib.random_int_range(-aw_2, aw_2);
        endY = monitor.y + GLib.random_int_range(-ah_2, ah_2);
	break;
      case 5: //Up-Left
        startX = monitor.x + monitor.width + GLib.random_int_range(-aw_2, aw_2);
        startY = monitor.y + monitor.height + GLib.random_int_range(-ah_2, ah_2);
        endX = monitor.x + GLib.random_int_range(-aw_2, aw_2);
        endY = monitor.y + GLib.random_int_range(-ah_2, ah_2);
	break;
      case 6: //Down-Right
        startX = monitor.x + GLib.random_int_range(-aw_2, aw_2);
        startY = monitor.y + GLib.random_int_range(-ah_2, ah_2);
        endX = monitor.x + monitor.width + GLib.random_int_range(-aw_2, aw_2);
        endY = monitor.y + monitor.height + GLib.random_int_range(-ah_2, ah_2);
	break;
      case 7: //Down-Left
        startX = monitor.x + monitor.width + GLib.random_int_range(-aw_2, aw_2);
        startY = monitor.y + GLib.random_int_range(-ah_2, ah_2);
        endX = monitor.x + GLib.random_int_range(-aw_2, aw_2);
        endY = monitor.y + monitor.height + GLib.random_int_range(-ah_2, ah_2);
	break;
      default:  //Unpredictable
    	startX = Math.floor(monitor.width/2) + GLib.random_int_range(-aw_2, aw_2);
    	startY = Math.floor(monitor.height/2) + GLib.random_int_range(-ah_2, ah_2);
    	endX = startX + GLib.random_int_range(-aw_2, aw_2);
    	endY = startY + GLib.random_int_range(-ah_2, ah_2);
    }
    
    
    return [startX, startY, endX, endY];
}

export { startEndPoints };
