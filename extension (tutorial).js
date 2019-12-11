/* DownFall extension.js
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
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

let text, button;

function _hideHello() {
  Main.uiGroup.remove_actor(text);
  text = null;
}

function _showHello() {
  if (!text) {
      text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
      Main.uiGroup.add_actor(text);
  }
  
  text.opacity = 255;
  
  let monitor = Main.layoutManager.primaryMonitor;
  
  text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - text.height / 2));
  
  Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}


class Extension {
    constructor() {
        button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
        let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });
        
        button.set_child(icon);
        button.connect('button-press-event', _showHello);
    }

    enable() {
        Main.panel._rightBox.insert_child_at_index(button, 0);
    }

    disable() {
        Main.panel._rightBox.remove_child(button);
    }
}

function init() {
    return new Extension();
}
