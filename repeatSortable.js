/*
   jQuery UI Sortable plugin wrapper

   Based on the angular-ui uiSortable directive
   
   Rather than working of ng-model it requires a ng-repeat and reorders
   the associated collection. Works with filtering.

   If you set orderBy then sorting will be disabled

   */
angular.module('ui.directives').directive('uiRepeatSortable', [ 'ui.config', '$parse', function(uiConfig, $parse) {
	return {
		link: function(scope, iElement, iAttrs) {

			var onReceive, onRemove, onStart, onStop, onUpdate, opts;

			// Find comment for ng-repeat directive
			var ngRepeat = iElement.contents().filter(function() {
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
			lhs, rhs, orderBy, valueIdent, keyIdent, collection, collectionGetter;
			if (! match) {
				throw Error("Expected ngRepeat in form of '_item_ in "+
							"_collection_' but got '" + expression + "'.");
			}
			lhs = match[1];
			rhs = match[2];
			match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
			if (!match) {
				throw Error("'item' in 'item in collection' should be "+
							"identifier or (key, value) but got '" +
							lhs + "'.");
			}
			if (match[1] === undefined) {
				throw Error("Cannot sort objects; '(key, value)' in collection "+
							"form not supported");
			}

			// Check for presence of an order by
			orderBy = rhs.match(/\|[\s]*orderBy:([^|]*)(\||$)/);
			if (orderBy) {
				orderByValue = $parse(orderBy[1])(scope);
				scope.$watch(orderBy[1], function(val) {
					if (val) {
						// When order by is set we can't sort as the order 
						// may not match our model. Disable sortable.
						// TODO: I guess you could support this given
						// positioning is relative to item you drop it next to
						iElement.sortable('disable');
					} else {
						iElement.sortable('enable');
					}
				});
			}

			valueIdent = match[3] || match[1];
			keyIdent = match[2];
			// ================================================================

			collectionGetter = $parse(rhs.split('|')[0]);
			collection = collectionGetter(scope);

			opts = angular.extend({}, uiConfig.sortable, scope.$eval(iAttrs.uiRepeatSortable));

			// jQuery UI Sortable Events follow

			onStart = function(e, ui) {
				var index;
				var data = {
					// Original index in the collection regardless of what
					// filters are applied
					index: null,
					// Original item object
					collectionItem: angular.element(ui.item).scope()[valueIdent]
				};
				for (var i=0;i<collection.length;i++) {
					if (collection[i] === data.collectionItem) {
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
				collection.splice(extractInsertionIndex(ui.item), 0, data.moved);
				collectionGetter.assign(scope, collection);
			};

			onRemove = function(e, ui) {
				// Remove item to be re-added and saved in onReceive
				var data = ui.item.data('uiRepeatSortable');
				data.moved = collection.splice(data.index, 1)[0];
			};

			onStop = function(e, ui) {
				var data = ui.item.data('uiRepeatSortable');
				if (data.resort && !data.relocate) {
					var end = extractInsertionIndex(ui.item);
					var start = data.index;
					collection.splice(end, 0, collection.splice(start, 1)[0]);
					collectionGetter.assign(scope, collection);
				}
				
				if (data.resort || data.relocate) {
					scope.$apply();
				}
			};

			// If user provided 'start' callback compose it with onStart function
			opts.start = (function(_start){
				return function(e, ui) {
					onStart(e, ui);
					if (typeof _start === "function")
						_start(e, ui);
				};
			})(opts.start);

			// If user provided 'start' callback compose it with onStop function
			opts.stop = (function(_stop){
				return function(e, ui) {
					onStop(e, ui);
					if (typeof _stop === "function")
						_stop(e, ui);
				};
			})(opts.stop);

			// If user provided 'update' callback compose it with onUpdate function
			opts.update = (function(_update){
				return function(e, ui) {
					onUpdate(e, ui);
					if (typeof _update === "function")
						_update(e, ui);
				};
			})(opts.update);

			// If user provided 'receive' callback compose it with onReceive function
			opts.receive = (function(_receive){
				return function(e, ui) {
					onReceive(e, ui);
					if (typeof _receive === "function")
						_receive(e, ui);
				};
			})(opts.receive);

			// If user provided 'remove' callback compose it with onRemove function
			opts.remove = (function(_remove){
				return function(e, ui) {
					onRemove(e, ui);
					if (typeof _remove === "function")
						_remove(e, ui);
				};
			})(opts.remove);

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
				var end = item.index();
				var adjacentItem, i;
				var sel = getVisibleItemSelector();

				adjacentItem = item.prev(sel);
				if (!adjacentItem.length) {
					adjacentItem = item.next(sel);
				}
				adjacentItem = angular.element(adjacentItem).scope()[valueIdent];

				for (i=0;i<collection.length;i++) {
					if (collection[i] === adjacentItem) {
						end = i;
						if (item.index() > i) {
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
