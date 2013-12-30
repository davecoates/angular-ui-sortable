(function () {
  'use strict';

  var ptor = protractor.getInstance();

  // dxOffset is used to offset each drag along the x-axis. This was necessary
  // to ensure the item dropped on a valid target.
  var itemHeight = 20, itemWidth = 100, dxOffset = 5, numberOfLists = 2;

  /**
   * Get repeater string for list (lists start at 1)
   *
   * @param {Integer} listNumber
   */
  function getRepeater(listNumber) {
    return by.repeater('item in items['+(listNumber-1)+']');
  }

  /**
   * Compare list data to values.
   *
   * @param {Integer} listNumber list number to compare against. This is index
   * into the controller items array
   * @param {Array} values array of values to compare against a
   */
  function expectDataToBe(listNumber, values) {
    browser.executeAsyncScript(function(callback) {
      callback(angular.element('body').scope().items);
    }).then(function(items) {
      var ids = items[listNumber-1].map(function (item) { return item.id; });
      expect(ids.join(',')).toBe(values.join(','));
    });
  }

  /**
   * Compare list ng-repeat html against list of values. We do this in addition
   * to looking at the data directly to make sure model and HTML are what we
   * expect when we apply filters etc. We do this as the DOM is modified by the
   * drag and drop so just making sure nothing has been messed up.
   *
   * @param {Integer} listNumber list number to compare against. This is index
   * into the controller items array used as in ng-repeat
   * @param {Array} values array of values to compare against a
   */
  function expectHtmlToBe(listNumber, values) {
    element.all(getRepeater(listNumber).column('{{item.id}}')).then(function (items) {
      for (var i=0; i < items.length; i++) {
        expect(items[i].getText()).toBe(''+values[i]);
      }
    });
  }

  function checkValues(listValues, key) {
    switch (key) {
      case 'before':
      case 'after':
        break;
      default:
        throw new Exception('Unknown key '+key);
    }

    var htmlKey = key+'Html', i;
    for (i = 0;i < numberOfLists;i++) {
      if (undefined !== listValues[i])  {
        expectDataToBe(i, listValues[i][key]);
        if (undefined === listValues[i][htmlKey]) {
          listValues[i][htmlKey] = listValues[i][key];
        }
        expectHtmlToBe(i, listValues[i][htmlKey]);
      }
    }
  }

  /**
   * Drag an item and compare to expected values
   *
   * @param {Integer} listNumber list to move from (starting at 1)
   * @param {Integer} itemNumber item in list to move (starting at 1)
   * @param {Object} listValues expected values before / after move
   *
   *  listValues is indexed by listNumber (starting at 0), eg
   *
   *  1: {
   *    before: {Array} model values before drag
   *    after: {Array} model values after drag
   *    beforeHtml: {Array} what HTML is displayed before drag
   *    afterHtml: {Array} what HTML is displayed after drag
   *  }
   *
   *  the *Html keys are relevant when you are filtering and so not all items
   *  in the model are shown in the HTML
   *
   * @param {Object} dydx offset to move
   * @param {Boolean} doSelect whether to do a selection rather than drag and
   * drop TODO: Not implemented
   */
  function dragAndCompare(listNumber, itemNumber, listValues, dydx, doSelect) {
    ptor.findElement(getRepeater(listNumber).row(itemNumber-1)).then(function (el) {

      checkValues(listValues, 'before');

      if (!doSelect) {
        dydx.dx = (dydx.dx || 0) + dxOffset;
        ptor.actions().dragAndDrop(
          el.findElement(by.css('.handle')),
          {x:dydx.dx || 0, y:dydx.dy || 0})
          .perform();
      } else {
        ptor.actions().dragAndDrop(
          el.findElement(by.css('.id')),
          {x:dydx.dx || 0, y:dydx.dy || 0})
          .perform();
      }

      checkValues(listValues, 'after');
    });

  }

  /**
   * Check item html against expected values
   *
   * @param {Integer} listNumber
   * @param {Object} values @see dragAndCompare listValues for details
   */
  function testItemHtml(listNumber, values) {
    var repeater = getRepeater(listNumber);
    if (values.length === 0) {
      expect(repeater.count()).toBe(0);
    } else {
      element.all(repeater.column('{{item.id}}')).then( function(ids) {
        for (var i=0;i<ids.length;i++) {
          expect(ids[i].getText()).toBe(''+values[i]);
        }
      });
    }
  }

  describe('uisRepeatSortable directive', function() {

    beforeEach(function() {
      browser.get('tests/sortable.html');
    });

    // =========================================================================

    it('should move first item down current list 1 position at a time', function() {
      dragAndCompare(1, 1,
                     { 1: { 
                       before: [1,2,3,4], 
                       after:  [2,1,3,4] } 
                     },
                     {dy: itemHeight}
                    );

      dragAndCompare(1, 2,
                     { 1: { 
                       before: [2,1,3,4], 
                       after:  [2,3,1,4] } 
                     },
                     {dy: itemHeight}
                    );

      dragAndCompare(1, 3,
                     { 1: { 
                       before: [2,3,1,4], 
                       after:  [2,3,4,1] } 
                     },
                     {dy: itemHeight}
                    );

    });

    it('should move first item to end of current list', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4,1]
        }
      };
      dragAndCompare(1,1, values, {dy: itemHeight * 3});
    });

    it('should move last item up current list 1 position at a time', function() {
      dragAndCompare(1, 4,
                     { 1: { 
                       before: [1,2,3,4], 
                       after:  [1,2,4,3] } 
                     },
                     {dy: -itemHeight}
                    );

      dragAndCompare(1, 3,
                     { 1: { 
                       before: [1,2,4,3], 
                       after:  [1,4,2,3] } 
                     },
                     {dy: -itemHeight}
                    );

      dragAndCompare(1, 2,
                     { 1: { 
                       before: [1,4,2,3], 
                       after:  [4,1,2,3] } 
                     },
                     {dy: -itemHeight}
                    );
    });

    it('should move last item to start of current list', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [4,1,2,3]
        }
      };
      dragAndCompare(1, 4, values, {dy: -itemHeight*3});
    });

    it('should move first item in first list to first postion of second list', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4]
        },
        2: {
          before: [5,6,7],
          after:  [1,5,6,7]
        }
      };
      dragAndCompare(1, 1, values, {dx: itemWidth});
    });

    it('should move first item in first list to second postion of second list', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4]
        },
        2: {
          before: [5,6,7],
          after:  [5,1,6,7]
        }
      };
      dragAndCompare(1, 1, values, {dx: itemWidth, dy:itemHeight});
    });

    it('should move item in first list to second list and back again', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4]
        },
        2: {
          before: [5,6,7],
          after:  [1,5,6,7]
        }
      };
      dragAndCompare(1, 1, values, {dx: itemWidth});

      dragAndCompare(2, 1, {
        1: {
          before: [2,3,4],
          after: [1,2,3,4]
        },
        2: {
          before: [1,5,6,7],
          after: [5,6,7]
        }
        }, {dx: -itemWidth, dy: -1});
    });

  });


  describe('uiRepeatSortable directive with filtering', function() {

    /**
     * Each test starts with visiting test.html
     */
    beforeEach(function() {
      browser.get('tests/sortable.html');
    });

    // =========================================================================

    it('should move first item down 1 then up 1', function() {
      ptor.findElement(by.model('search')).sendKeys('A');
      var moveDown = {
        1: {
          before: [1,2,3,4],
          after:  [2,3,1,4],
          beforeHtml: [1,3],
          afterHtml: [3,1]
        }
      };
      dragAndCompare(1, 1, moveDown, {dy: itemHeight});

      var moveUp = {
        1: {
          before: [2,3,1,4],
          after:  [2,1,3,4],
          beforeHtml: [3,1],
          afterHtml: [1,3]
        }
      };
      dragAndCompare(1, 2, moveUp, {dy: -itemHeight});

      // Remove filter and check HTML order is what we expect
      ptor.findElement(by.model('search')).clear();
      expectHtmlToBe(1, [2,1,3,4]);

    });

    it('should move item from list 1 to list 2', function() {
      ptor.findElement(by.model('search')).sendKeys('B');
      dragAndCompare(1, 1,
                     { 1: { 
                       before: [1,2,3,4], 
                       after:  [1,3,4],
                       beforeHtml: [2,4],
                       afterHtml: [4]
                     },
                     2: {
                       before: [5,6,7], 
                       after:  [5,2,6,7],
                       beforeHtml: [6],
                       afterHtml: [2,6]
                     }
                     },
                     {dx: itemWidth}
                    );

      dragAndCompare(2, 1,
                     { 1: { 
                       before: [1,3,4], 
                       after:  [1,3,2,4],
                       beforeHtml: [4],
                       afterHtml: [2,4]
                     }, 
                     2: {
                       before: [5,2,6,7], 
                       after:  [5,6,7],
                       beforeHtml: [2,6],
                       afterHtml: [6]
                     }
                     },
                     {dx: -itemWidth}
                    );

      // Remove filter and check HTML order is what we expect
      ptor.findElement(by.model('search')).clear();
      expectHtmlToBe(1, [1,3,2,4]);
    });

  });

  describe('Selectable directive', function() {

    beforeEach(function() {
      browser.get('tests/selectable.html');
    });

    // =========================================================================
    it('should select first two items and start drag and cancel', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) {
        expect(elems.length).toBe(2);
      });

      dragAndCompare(1, 1, {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      }, {dx: 50});
    });

    it('should select first two items and move them down one position', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) {
        expect(elems.length).toBe(2);
      });

      dragAndCompare(1, 1, {
        1: {
          before: [1,2,3,4],
          after:  [3,1,2,4]
        }
      }, {dy: itemHeight*2});

    });

    it('should select last two items and move them up one position', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 3, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) {
        expect(elems.length).toBe(2);
      });

      dragAndCompare(1, 3, {
        1: {
          before: [1,2,3,4],
          after:  [1,3,4,2]
        }
      }, {dy: -itemHeight});
    });

    it('should select first two items and move them down one position (drag on second item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 2, {
        1: {
          before: [1,2,3,4],
          after:  [3,1,2,4]
        }
      }, {dy: itemHeight-1});
      ptor.sleep(1000);
    });

    it('should select last two items and move them up one position (drag on second item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 3, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 4, {
        1: {
          before: [1,2,3,4],
          after:  [1,3,4,2]
        }
      }, {dy: -itemHeight*2});
    });

    it('should select first two items and drag to second column first position', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 1, {
        1: {
          before: [1,2,3,4],
          after:  [3,4],
          beforeHtml: [1,2,3,4],
          afterHtml: [3,4]
        },
        2: {
          before: [5,6,7],
          after: [1,2,5,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [1,2,5,6,7]
        }
      }, {dx: 100});
    });

    it('should select first two items and drag to second column second position', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 1, {
        1: {
          before: [1,2,3,4],
          after:  [3,4],
          beforeHtml: [1,2,3,4],
          afterHtml: [3,4]
        },
        2: {
          before: [5,6,7],
          after: [5,1,2,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [5,1,2,6,7]
        }
      }, {dx: 100, dy: 20});
    });

    it('should select first two items and drag to second column first position (drag on 2nd item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 2, {
        1: {
          before: [1,2,3,4],
          after:  [3,4],
          beforeHtml: [1,2,3,4],
          afterHtml: [3,4]
        },
        2: {
          before: [5,6,7],
          after: [1,2,5,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [1,2,5,6,7]
        }
        // -20 because we are dragging from 2nd item so need to go up one to get to first
      }, {dx: 100, dy: -20}); 
    });

    it('should select first two items and drag to second column second position (drag on 2nd item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 2, {
        1: {
          before: [1,2,3,4],
          after:  [3,4],
          beforeHtml: [1,2,3,4],
          afterHtml: [3,4]
        },
        2: {
          before: [5,6,7],
          after: [5,1,2,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [5,1,2,6,7]
        }
        // dy of 0 as we are already in second position
      }, {dx: 100, dy: 0});
    });

    it('should select first 3 items and drag to second column first position', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight*2}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(3); });

      dragAndCompare(1, 1, {
        1: {
          before: [1,2,3,4],
          after:  [4],
          beforeHtml: [1,2,3,4],
          afterHtml: [4]
        },
        2: {
          before: [5,6,7],
          after: [1,2,3,5,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [1,2,3,5,6,7]
        }
      }, {dx: 100});
    });

    it('should select first 3 items and drag to second column first position (drag on 2nd item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight*2}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(3); });

      dragAndCompare(1, 2, {
        1: {
          before: [1,2,3,4],
          after:  [4],
          beforeHtml: [1,2,3,4],
          afterHtml: [4]
        },
        2: {
          before: [5,6,7],
          after: [1,2,3,5,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [1,2,3,5,6,7]
        }
      }, {dx: 100, dy: -20});
    });

    it('should select first 3 items and drag to second column first position (drag on 3rd item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight*2}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(3); });

      dragAndCompare(1, 3, {
        1: {
          before: [1,2,3,4],
          after:  [4],
          beforeHtml: [1,2,3,4],
          afterHtml: [4]
        },
        2: {
          before: [5,6,7],
          after: [1,2,3,5,6,7],
          beforeHtml: [5,6,7],
          afterHtml: [1,2,3,5,6,7]
        }
      }, {dx: 100, dy: -40});
    });

    it('should select last three items and move them up one position', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 2, values, {dy: itemHeight*2}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(3); });

      dragAndCompare(1, 2, {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4,1]
        }
      }, {dy: -itemHeight});
    });

    it('should select last three items and move them up one position (drag on 2nd item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 2, values, {dy: itemHeight*2}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(3); });

      dragAndCompare(1, 3, {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4,1]
        }
      }, {dy: -itemHeight*2});
    });

    it('should select last three items and move them up one position (drag on 3rd item)', function() {
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4]
        }
      };
      dragAndCompare(1, 2, values, {dy: itemHeight*2}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(3); });

      dragAndCompare(1, 4, {
        1: {
          before: [1,2,3,4],
          after:  [2,3,4,1]
        }
      }, {dy: -itemHeight*3});
    });

    it('should filter and select "B" items and move them to second column before "B" item', function() {
      ptor.findElement(by.model('search')).sendKeys('B');
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4],
          beforeHtml: [2,4],
          afterHtml: [2,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 1, {
        1: {
          before: [1,2,3,4],
          after:  [1,3],
          beforeHtml: [2,4],
          afterHtml: []
        },
        2: {
          before: [5,6,7],
          after:  [5,2,4,6,7],
          beforeHtml: [6],
          afterHtml: [2,4,6]
        }
      }, {dx: itemWidth});

      ptor.findElement(by.model('search')).clear();
      testItemHtml(1, [1,3]);
      testItemHtml(2, [5,2,4,6,7]);
    });

    it('should filter and select "B" items and move them to second column before "B" item (drag on 2nd item)', function() {
      ptor.findElement(by.model('search')).sendKeys('B');
      var values = {
        1: {
          before: [1,2,3,4],
          after:  [1,2,3,4],
          beforeHtml: [2,4],
          afterHtml: [2,4]
        }
      };
      dragAndCompare(1, 1, values, {dy: itemHeight}, true);

      element.all(by.css('.ui-selected')).then(function (elems) { expect(elems.length).toBe(2); });

      dragAndCompare(1, 2, {
        1: {
          before: [1,2,3,4],
          after:  [1,3],
          beforeHtml: [2,4],
          afterHtml: []
        },
        2: {
          before: [5,6,7],
          after:  [5,2,4,6,7],
          beforeHtml: [6],
          afterHtml: [2,4,6]
        }
      }, {dx: itemWidth, dy: -itemHeight});

      ptor.findElement(by.model('search')).clear();
      testItemHtml(1, [1,3]);
      testItemHtml(2, [5,2,4,6,7]);
    });



  });

}());
