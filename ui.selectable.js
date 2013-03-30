angular.module('ui.directives').directive('uiSelectable', [function() {
	return {
		require: 'uiRepeatSortable',
    priority: -1, 
		link: function(scope, iElement, iAttrs, ctrl) {
			var onReceive, onRemove, onStart, onStop, onUpdate, onDeactivate;

			var helper;					// helper function for sortable
			var opts;           // options for ui-selectable
			var sortOpts;				// options passed to ui-sortable
			var placeholderSelector;
			
			opts = angular.extend({}, scope.$eval(iAttrs.uiSelectable));
			
			if (opts.moveWithSortable) {
				// It would be nice if we could just register listeners on the sort events. Unfortunately
				// these always happen before the uiSortable events that modify our model etc. We need
				// to our changes after these have fire so here we modify the options to uiSortable to
				// include our own listeners which will always be fired after uiSortable but before any
				// other custom listeners passed through to uiSortable by the user.
				sortOpts = scope.$eval(iAttrs.uiRepeatSortable) || {};
				placeholderSelector = '.'+(sortOpts.placeholder || 'ui-sortable-placeholder');
				
				// Helper function that clones all selected items
				helper = function(event, element) {
					var elementClone = element.clone();
					var clone = $('<div class="ui-sortable-helpers"></div>').append(elementClone);
					if (element.hasClass('ui-selected')) {
						var selectedElements = iElement.find('.ui-selected');
						var isBefore = true;
						// Insert clones in correct position. This ensures if the order they are in is the
						// order they get dragged in
						selectedElements.each(function(index, selectedElement) {
							if ($(selectedElement).is(element)) {
								isBefore = false;
								return;
							}
							var c = $(selectedElement).clone();
							if (isBefore) {
								c.insertBefore(elementClone);
							} else {
								c.insertAfter(elementClone);
								elementClone = c;
							}
							$(selectedElement).addClass('ui-sortable-selected');
						});
					}
					return clone;
				};

				onStart = function(event, ui) {
					if (ui.item.hasClass('ui-selected')) {
            var sortData = ui.item.data('uiRepeatSortable');
            var data = ui.item.data('uiRepeatSortable'), index; 
						$(sortOpts.items || '> *', iElement).not(placeholderSelector).each(function(index, item) {
							if ($(item).hasClass('ui-selected')) {
                element = angular.element(item),
                collectionItem = element.scope()[ctrl.valueIdent];
                for (var i=0;i<ctrl.collection.length;i++) {
                  if (ctrl.collection[i] === collectionItem) {
                    index = i;
                  }
                }
                // ignore dragged item - this is handled by ui-sortable
                if (index === data.index) {
                  return;
                }
                sortData.sortingItems.push({
                  element: element,
                  item: collectionItem,
                  index: index
                });

							}
						});
            ui.item.data('uiRepeatSortable', sortData);
					} 
				};

				onUpdate = function(event, ui) {
					var selectedItems;

					// Here we need to move any selected items with the item that has been updated
					// We simply find any selected items and insert them after ui.item
					if (ui.item.hasClass('ui-selected')) {
						// if sender is null it means we are within the same column 
						// (ie. we are just sorting, not moving column)
						if (null === ui.sender) {
							selectedItems = iElement.find('.ui-selected').not(ui.item);
						} else {
							selectedItems = ui.sender.find('.ui-selected').not(ui.item);
						}

						if (selectedItems.length > 0) {
							selectedItems.insertAfter(ui.item);
						}
					}
				};

				onDeactivate = function(event, ui) {
					$('.ui-sortable-selected').removeClass('ui-sortable-selected');
				};

				// Compose any specified event handlers with our handlers
				
        ctrl.registerEvent('deactivate', onDeactivate);
        ctrl.registerEvent('start', onStart);
        ctrl.registerEvent('update', onUpdate);
			}

      if (!sortOpts.helper) {
        iElement.sortable('option', 'helper', helper);
      }
      iElement.selectable(opts);
		}
	};
}]);
