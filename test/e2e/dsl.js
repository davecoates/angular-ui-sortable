(function(angular) {

  var extractIds = function extractIds (a) { return a.id; };

  /**
   * Compare two arrays (they aren't Future objects)
   */
  angular.scenario.dsl('compare', function() {
    return function(items, comp) {
      return this.addFutureAction('compare values', function($window, $document, done) {
        expect(this.addFuture('scope items', function(done) {
          done(null, items);
        })).toEqual(comp);
        done();
      });
    };
  });

  /**
   * Drag an item and compare before / after values
   *
   * @param Integer listNumber which list to drag from (1 or 2)
   * @param Integer itemNumber which item in list to drag (1 to list.length)
   * @param Object columnValues values for each list to compare
   * @param Object dydx translation to be applied to item
   */
  angular.scenario.dsl('dragAndCompare', function() {
    return function(listNumber, itemNumber, columnValues, dydx, doSelect) {
      return this.addFutureAction('drag element and check scope items', function($window, $document, done) {
        var el = $window.angular.element('ul#list-'+listNumber+' li').eq(itemNumber-1),
        scope = el.scope();

        // Compare first column values if set
        if (columnValues[0]) {
          compare(scope.items[0].map(extractIds), columnValues[0].before);
        }
        // Compare second column values if set
        if (columnValues[1]) {
          compare(scope.items[1].map(extractIds), columnValues[1].before);
        }

        // Offset dy/dx by 1 so it will move rather than stay within selected
        // item. Not necessary if using tolerance: pointer
        if (!doSelect) {
          /*
          if (dydx.dx) {
            dydx.dx += (dydx.dx > 0) ? 1 : -1;
          }
          if (dydx.dy) {
            dydx.dy += (dydx.dy > 0) ? 1 : -1;
          }
          */
          el.find('.handle').simulate("drag", dydx);
        } else {
          el.simulate("drag", dydx);
        }

        // Check values have updated
        if (columnValues[0]) {
          compare(scope.items[0].map(extractIds), columnValues[0].after);
        }
        if (columnValues[1]) {
          compare(scope.items[1].map(extractIds), columnValues[1].after);
        }

        done();
      });
    };
  });

})(angular);
