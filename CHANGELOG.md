# Change Log

## 3.0.0

* Switch to [Semantic Versioning](https://semver.org/)
* Complete re-write of the structure
* Replaced `destroy()` with `hide()` on each fall
* Made FallItems children of FIM for quick removal
* Replaced es6 Promises with `GLib.idle_add()`
* Re-worked Matrix© trails
* Addressed issue where GNOME shell froze

## 2.2

* Initial gtk4 support for GNOME 40

## 2.1

* Bugfix release
* Implemented gjs delays to reduce CPU load
* Improved Matrix© trails

## 2.0

* Multi-item support
* Renamed 'chars' to 'items'
* Better handling of font properties (bold, italic, etc.)
* Implemented firework explosions
* First implementation of Matrix© trails
* Improved 'About' tab

## 1.1

* Custom text, color, font, and size
* Custom directions (down, up, right, left, up-right, up-left, down-right, down-left)
* Custom time, rotation, and drift
* Multi-monitor support
