describe('uiRepeatSortable directive', function() {

  var itemHeight = 20, itemWidth = 100;
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
    return function(listNumber, itemNumber, columnValues, dydx) {
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
        // item
        if (dydx.dx) {
          dydx.dx += (dydx.dx > 0) ? 1 : -1;
        }
        if (dydx.dy) {
          dydx.dy += (dydx.dy > 0) ? 1 : -1;
        }

        // Simulate drag event
        el.simulate("drag", dydx);

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
  
  /**
   * Each test starts with visiting test.html
   */
  beforeEach(function() {
    browser().navigateTo('/test/e2e/test.html');
  });

  // =========================================================================

  it('should move first item down current list 1 position at a time', function() {
    dragAndCompare(1, 1,
                   { 0: { 
                     before: [1,2,3,4], 
                     after:  [2,1,3,4] } 
                   },
                   {dy: itemHeight}
                  );

    dragAndCompare(1, 2,
                   { 0: { 
                     before: [2,1,3,4], 
                     after:  [2,3,1,4] } 
                   },
                   {dy: itemHeight}
                  );

    dragAndCompare(1, 3,
                   { 0: { 
                     before: [2,3,1,4], 
                     after:  [2,3,4,1] } 
                   },
                   {dy: itemHeight}
                  );

  });

  it('should move first item to end of current list', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4,1]
      }
    };
    dragAndCompare(1,1, values, {dy: itemHeight * 3});
  });

  it('should move last item up current list 1 position at a time', function() {
    dragAndCompare(1, 4,
                   { 0: { 
                     before: [1,2,3,4], 
                     after:  [1,2,4,3] } 
                   },
                   {dy: -itemHeight}
                  );

    dragAndCompare(1, 3,
                   { 0: { 
                     before: [1,2,4,3], 
                     after:  [1,4,2,3] } 
                   },
                   {dy: -itemHeight}
                  );

    dragAndCompare(1, 2,
                   { 0: { 
                     before: [1,4,2,3], 
                     after:  [4,1,2,3] } 
                   },
                   {dy: -itemHeight}
                  );
  });

  it('should move last item to start of current list', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [4,1,2,3]
      }
    };
    dragAndCompare(1, 4, 0, {dy: -itemHeight*3});
  });

  it('should move first item in first list to first postion of second list', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4]
      },
      1: {
        before: [5,6,7],
        after:  [1,5,6,7]
      }
    };
    dragAndCompare(1, 1, values, {dx: itemWidth});
  });

  it('should move first item in first list to second postion of second list', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4]
      },
      1: {
        before: [5,6,7],
        after:  [5,1,6,7]
      }
    };
    dragAndCompare(1, 1, values, {dx: itemWidth, dy:itemHeight});
  });

  it('should move item in first list to second list and back again', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4]
      },
      1: {
        before: [5,6,7],
        after:  [1,5,6,7]
      }
    };
    dragAndCompare(1, 1, values, {dx: itemWidth});

    dragAndCompare(2, 1, {
      0: {
        before: [2,3,4],
        after: [1,2,3,4]
      },
      1: {
        before: [1,5,6,7],
        after: [5,6,7]
      }
      }, {dx: -itemWidth, dy: -1});
  });

});
