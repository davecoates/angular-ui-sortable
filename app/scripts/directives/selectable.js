(function(angular, $) {
  'use strict';

  angular.module('uis').directive('uisSelectable', [function() {
    return {
      require: 'uisSortable',
      priority: -1,
      link: function(scope, iElement, iAttrs, ctrl) {
        var onStart, onUpdate, onDeactivate;

        var helper,					// helper function for sortable
            opts,           // options for ui-selectable
            sortOpts,				// options passed to ui-sortable
            placeholderSelector;

        opts = angular.extend({}, scope.$eval(iAttrs.uisSelectable));

        if (opts.moveWithSortable) {
          // It would be nice if we could just register listeners on the sort events. Unfortunately
          // these always happen before the uiSortable events that modify our model etc. We need
          // to our changes after these have fire so here we modify the options to uiSortable to
          // include our own listeners which will always be fired after uiSortable but before any
          // other custom listeners passed through to uiSortable by the user.
          sortOpts = scope.$eval(iAttrs.uisSortable) || {};
          placeholderSelector = '.'+(sortOpts.placeholder || 'ui-sortable-placeholder');

          // Helper function that clones all selected items
          helper = function(event, element) {
            var elementClone = element.clone();
            var clone = angular.element('<div class="ui-sortable-helpers"></div>').append(elementClone);
            if (element.hasClass('ui-selected')) {
              var selectedElements = iElement.find('.ui-selected');
              var isBefore = true;
              // Insert clones in correct position. This ensures if the order they are in is the
              // order they get dragged in
              selectedElements.each(function(index, selectedElement) {
                var $selectedElement = $(selectedElement);
                if ($selectedElement.is(element)) {
                  isBefore = false;
                  return;
                }
                var c = $selectedElement.clone();
                if (isBefore) {
                  c.insertBefore(elementClone);
                } else {
                  c.insertAfter(elementClone);
                  elementClone = c;
                }
                $selectedElement.addClass('ui-sortable-selected');
              });
            }
            return clone;
          };

          onStart = function(event, ui) {
            if (ui.item.hasClass('ui-selected')) {
              var sortData = ui.item.data('uisSortable');
              var data = ui.item.data('uisSortable');
              $(sortOpts.items || '> *', iElement).not(placeholderSelector).each(function(index, item) {
                var element = angular.element(item),
                    collectionItem = element.scope()[ctrl.valueIdent],
                    collection, i;
                if ($(item).hasClass('ui-selected')) {
                  collection = ctrl.getCollection();
                  for (i=0;i<collection.length;i++) {
                    if (collection[i] === collectionItem) {
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
              ui.item.data('uisSortable', sortData);
            }
          };

          onUpdate = function(event, ui) {
            // Here we need to move any selected items with the item that has been updated
            // We simply find any selected items and insert them in the correct
            // position relative to ui.item
            if (ui.item.hasClass('ui-selected')) {
              var data = ui.item.data('uisSortable');
              var isAfterDroppedItem = false, lastItem = ui.item, currentItem, i;
              data.sortingItems.sort(function(a,b) { return a.index > b.index; });
              for (i=0; i < data.sortingItems.length; i++) {
                currentItem = data.sortingItems[i];
                if (currentItem.index === data.index) {
                  isAfterDroppedItem = true;
                } else {
                  if (!isAfterDroppedItem) {
                    currentItem.element.insertBefore(ui.item);
                  } else {
                    currentItem.element.insertAfter(lastItem);
                    lastItem = currentItem.element;
                  }
                }
              }
            }
          };

          onDeactivate = function() {
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

}(angular, $));
