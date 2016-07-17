# rGrid

Used to implement common data grid widget based on Riot. It includes:

* rtable Core widget, used for data grid display
* pagination
* query_config Query condition widget
* dataset Data source API
* rGrid Data grid which combined above components.

## Install

rGrid depends on Riot, jQuery mainly. They are not included in this project, so
you can install them via bower:

```
bower install jquery riot
```

Examples think these packages should be installed in `bower_components` of rGrid
project directory.

Source tags are exists in src directory, it should be compiled via Riot. You can
install Riot via npm(It's not the same as bower). The compiled .js files are already
placed in dist directory, you can use the directly.

For example:

```
npm install riot
```

then compile `rtable.tag` or other tag files like:

```
riot -w rtable.tag ../dist
```

## Development description

For now, the functionalities is simple, and the performance is not so good I think,
but I hope I can improve it continuously, and also hope you can help this project
with me.


## rtable

rtable is inspired by several grid or table project, especially https://github.com/crisward/riot-grid2
about large data display and fixed left columns and header.

The features list which already be implemented or will be implemented：

- [X] Large data support. Only display necessary data to increase display speed
- [X] Data source based. So `dataset.js` is introduced, and I bowered it from vis project, and I add tree and multiple column support
- [X] Multi header, and the definition may be as simple as possible
- [X] Support frozen columns and will be display in left pane
- [X] Header can be float and could be scrolled at horizontal level
- [X] Header column width could be resized
- [X] Auto fit grid width, if there are some columns which have not width given, they'll be set with reset width
- [ ] Column could be visible toggled dynamically
- [ ] Order number column support
- [X] Custom defined buttons
- [ ] Resize width and height of grid
- [ ] Checkbox column support
- [ ] Context menu
- [X] Custom render for data cell
- [ ] Custom style for row
- [ ] Selected row support, include: single selection, multi selection, also support checkbox selection
- [ ] Cell editor
- [ ] Tree grid support
- [ ] Column order support

## Examples

In `examples` directory
