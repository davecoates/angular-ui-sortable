(function(angular) {
  "use strict";

  var uiRepeatSortableController = ['$scope', '$attrs', '$element', '$parse',
    function($scope, $attr, $element, $parse) {
      this.events = {};
      this.eventSortRequired = {};

      this.registerEvent = function(eventName, callback, priority) {
        if (undefined === priority) {
          priority = 0;
        }
        if (undefined === this.events[eventName]) {
          this.events[eventName] = [];
        }
        this.events[eventName].push({
          priority: priority,
          callback: callback
        });
        this.eventSortRequired[eventName] = true;
      };

      this.triggerEvent = function(eventName, e, ui) {
        if (!angular.isArray(this.events[eventName])) return;

        if (this.eventSortRequired[eventName]) {
          this.events[eventName].sort(function(a, b) {
            return a.priority < b.priority;
          });
          this.eventSortRequired[eventName] = false;
        }

        for (var i=0;i<this.events[eventName].length;i++) {
          this.events[eventName][i].callback(e, ui);
        }
      };
      
      // Find comment for ng-repeat directive
      // filter() requires jQuery - must be included before angular 
      // otherwise we will be using jqlite which doesn't have it
      var ngRepeat = $element.contents().filter(function() {
        return this.nodeType === 8 && 
          this.nodeValue.match(/^[\s]*ngRepeat:/);
      });

      if (!ngRepeat) {
        throw new Error('Required ng-repeat not found');
      }

      // ================================================================
      // Taken & modified from ng-repeat directive to identify collection
      // and item names
      var expression =
        ngRepeat[0].nodeValue.split(':').splice(1).join(':');

      var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
      lhs, rhs, orderBy, keyIdent;
      if (! match) {
        throw new Error("Expected ngRepeat in form of '_item_ in "+
                        "_collection_' but got '" + expression + "'.");
      }
      lhs = match[1];
      rhs = match[2];
      match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
      if (!match) {
        throw new Error("'item' in 'item in collection' should be "+
                        "identifier or (key, value) but got '" +
                        lhs + "'.");
      }
      if (match[1] === undefined) {
        throw new Error("Cannot sort objects; '(key, value)' in collection "+
                        "form not supported");
      }

      // Check for presence of an order by
      orderBy = rhs.match(/\|[\s]*orderBy:([^|]*)(\||$)/);
      if (orderBy) {
        $scope.$watch(orderBy[1], function(val) {
          if (val) {
            // When order by is set we can't sort as the order 
            // may not match our model. Disable sortable.
            // TODO: I guess you could support this given
            // positioning is relative to item you drop it next to
            $element.sortable('disable');
          } else {
            $element.sortable('enable');
          }
        });
      }

      this.valueIdent = match[3] || match[1];
      keyIdent = match[2];
      // ================================================================

      this.collectionGetter = $parse(rhs.split('|')[0]);
      this.collection = this.collectionGetter($scope);

    }


  ];

  /**
   * jQuery UI Sortable plugin wrapper
   *
   * Based on the angular-ui uiSortable directive
   * 
   * Rather than working of ng-model it requires a ng-repeat and reorders
   * the associated collection. Works with filtering.
   *
   * If you set orderBy then sorting will be disabled
   */
  angular.module('ui.directives').directive('uiRepeatSortable', [ 'ui.config', '$parse', function(uiConfig, $parse) {
    return {
      controller: uiRepeatSortableController,
      link: function(scope, iElement, iAttrs, ctrl) {
        var onReceive, onRemove, onStart, onStop, onUpdate, opts;

        opts = angular.extend({}, uiConfig.sortable, scope.$eval(iAttrs.uiRepeatSortable));

        // jQuery UI Sortable Events follow

        onStart = function(e, ui) {
          var index;
          var data = {
            // Original index in the collection regardless of what
            // filters are applied
            index: null,
            // Original item object
            collectionItem: angular.element(ui.item).scope()[ctrl.valueIdent]
          };
          for (var i=0;i<ctrl.collection.length;i++) {
            if (ctrl.collection[i] === data.collectionItem) {
              index = i;
            }
          }

          // Save position of dragged item
          data.index = index;
          ui.item.data('uiRepeatSortable', data);
        };

        onUpdate = function(e, ui) {
          // Flag update required. We only need to do something if we
          // haven't moved sortable (ie. onReceive hasn't fired)
          // See onStop
          ui.item.data('uiRepeatSortable').resort = true;
        };

        onReceive = function(e, ui) {
          var data = ui.item.data('uiRepeatSortable');
          data.relocate = true;
          // Add item and update collection
          ctrl.collection.splice(extractInsertionIndex(ui.item), 0, data.moved);
          ctrl.collectionGetter.assign(scope, ctrl.collection);
        };

        onRemove = function(e, ui) {
          // Remove item to be re-added and saved in onReceive
          var data = ui.item.data('uiRepeatSortable');
          data.moved = ctrl.collection.splice(data.index, 1)[0];
        };

        onStop = function(e, ui) {
          var data = ui.item.data('uiRepeatSortable');
          if (data.resort && !data.relocate) {
            var end = extractInsertionIndex(ui.item);
            var start = data.index;
            ctrl.collection.splice(end, 0, ctrl.collection.splice(start, 1)[0]);
            ctrl.collectionGetter.assign(scope, ctrl.collection);
          }
          
          if (data.resort || data.relocate) {
            scope.$apply();
          }
        };

        ctrl.registerEvent('start', onStart);
        if (typeof opts.start === 'function') {
          ctrl.registerEvent('start', opts.start);
        }
        opts.start = function(e, ui) {
            ctrl.triggerEvent('start', e, ui);
        };

        ctrl.registerEvent('stop', onStop);
        if (typeof opts.stop === 'function') {
          ctrl.registerEvent('stop', opts.stop);
        }
        opts.stop = function(e, ui) {
            ctrl.triggerEvent('stop', e, ui);
        };

        ctrl.registerEvent('update', onUpdate);
        if (typeof opts.update === 'function') {
          ctrl.registerEvent('update', opts.update);
        }
        opts.update = function(e, ui) {
            ctrl.triggerEvent('update', e, ui);
        };

        ctrl.registerEvent('remove', onRemove);
        if (typeof opts.remove === 'function') {
          ctrl.registerEvent('remove', opts.remove);
        }
        opts.remove = function(e, ui) {
            ctrl.triggerEvent('remove', e, ui);
        };

        ctrl.registerEvent('receive', onReceive);
        if (typeof opts.receive === 'function') {
          ctrl.registerEvent('receive', opts.receive);
        }
        opts.receive = function(e, ui) {
            ctrl.triggerEvent('receive', e, ui);
        };

        opts.deactivate = function(e, ui) {
          ctrl.triggerEvent('deactivate', e, ui);
        };

        // Create sortable
        iElement.sortable(opts);

        /**
         * Get selector to get all visible ng-repeat items 
         *
         * NOTE: If you do something like class="blah ng-repeat: item.." 
         * this won't pick it up.
         *
         * @return Array
         */
        var getVisibleItemSelector = function() {
          var attributeVariants = [
            '[ng-repeat]',
            '[ng\\:repeat]',
            '[ng_repeat]',
            '[x-ng-repeat]',
            '[data-ng-repeat]',
            '[class^="ng-repeat"]'  // class="ng-repeat: valueIdent" .. 
          ];
          return attributeVariants.join(',');
        };

        /**
         * Extract index selected item should be inserted into in the
         * original collection 
         *
         * @param Object jquery ui.item 
         *
         * @return integer 
         */
        var extractInsertionIndex = function(item) {
          var end = item.index(),
            sel = getVisibleItemSelector(),
            insertAfter = true,
            adjacentItem, i;

          adjacentItem = item.prev(sel);
          if (!adjacentItem.length) {
            adjacentItem = item.next(sel);
            insertAfter = false;
          }
          if (adjacentItem.length === 0) {
            // No adjacent items in destination sortable
            return 0;
          }

          adjacentItem = angular.element(adjacentItem).scope()[ctrl.valueIdent];

          for (i=0;i<ctrl.collection.length;i++) {
            if (ctrl.collection[i] === adjacentItem) {
              end = i;
              // Offset index if we are inserting after. Note the 
              // check against the original index is because if
              // original item is before us in collection it won't be
              // once we remove it so no offset is required.
              if (insertAfter && i <= item.data('uiRepeatSortable').index) {
                end++;
              }
              break;
            }
          }

          return end;
        };


      }
    };
  }
  ]);
})(angular);
