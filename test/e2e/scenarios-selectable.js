describe('Selectable directive', function() {

  var itemHeight = 20, itemWidth = 100;

  /**
   * Each test starts with visiting test.html
   */
  beforeEach(function() {
    browser().navigateTo('/test/e2e/test-selectable.html');
  });

  // =========================================================================
  it('should select first two items and start drag and cancel', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 1, {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
      }, {dx: 50});
  });

  it('should select first two items and move them down one position', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 1, {
      0: {
        before: [1,2,3,4],
        after:  [3,1,2,4]
      }
      }, {dy: itemHeight*2});

  });

  it('should select last two items and move them up one position', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 3, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 3, {
      0: {
        before: [1,2,3,4],
        after:  [1,3,4,2]
      }
      }, {dy: -itemHeight});
  });

  it('should select first two items and move them down one position (drag on second item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 2, {
      0: {
        before: [1,2,3,4],
        after:  [3,1,2,4]
      }
      }, {dy: itemHeight});
  });

  it('should select last two items and move them up one position (drag on second item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 3, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 4, {
      0: {
        before: [1,2,3,4],
        after:  [1,3,4,2]
      }
      }, {dy: -itemHeight*2});
  });

  it('should select first two items and drag to second column first position', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 1, {
      0: {
        before: [1,2,3,4],
        after:  [3,4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [3,4]
      },
      1: {
        before: [5,6,7],
        after: [1,2,5,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [1,2,5,6,7]
      }
      }, {dx: 100});
  });

  it('should select first two items and drag to second column second position', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 1, {
      0: {
        before: [1,2,3,4],
        after:  [3,4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [3,4]
      },
      1: {
        before: [5,6,7],
        after: [5,1,2,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [5,1,2,6,7]
      }
      }, {dx: 100, dy: 20});
  });

  it('should select first two items and drag to second column first position (drag on 2nd item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 2, {
      0: {
        before: [1,2,3,4],
        after:  [3,4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [3,4]
      },
      1: {
        before: [5,6,7],
        after: [1,2,5,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [1,2,5,6,7]
      }
      // -20 because we are dragging from 2nd item so need to go up one to get to first
      }, {dx: 100, dy: -20}); 
  });

  it('should select first two items and drag to second column second position (drag on 2nd item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 2, {
      0: {
        before: [1,2,3,4],
        after:  [3,4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [3,4]
      },
      1: {
        before: [5,6,7],
        after: [5,1,2,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [5,1,2,6,7]
      }
      // dy of 0 as we are already in second position
      }, {dx: 100, dy: 0});
  });

  it('should select first 3 items and drag to second column first position', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight*2}, true);

    expect(element('.ui-selected').count()).toBe(3);

    testDrag(1, 1, {
      0: {
        before: [1,2,3,4],
        after:  [4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [4]
      },
      1: {
        before: [5,6,7],
        after: [1,2,3,5,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [1,2,3,5,6,7]
      }
      }, {dx: 100});
  });

  it('should select first 3 items and drag to second column first position (drag on 2nd item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight*2}, true);

    expect(element('.ui-selected').count()).toBe(3);

    testDrag(1, 2, {
      0: {
        before: [1,2,3,4],
        after:  [4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [4]
      },
      1: {
        before: [5,6,7],
        after: [1,2,3,5,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [1,2,3,5,6,7]
      }
      }, {dx: 100, dy: -20});
  });

  it('should select first 3 items and drag to second column first position (drag on 3rd item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight*2}, true);

    expect(element('.ui-selected').count()).toBe(3);

    testDrag(1, 3, {
      0: {
        before: [1,2,3,4],
        after:  [4],
        htmlBefore: [1,2,3,4],
        htmlAfter: [4]
      },
      1: {
        before: [5,6,7],
        after: [1,2,3,5,6,7],
        htmlBefore: [5,6,7],
        htmlAfter: [1,2,3,5,6,7]
      }
      }, {dx: 100, dy: -40});
  });

  it('should select last three items and move them up one position', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 2, values, {dy: itemHeight*2}, true);

    expect(element('.ui-selected').count()).toBe(3);

    testDrag(1, 2, {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4,1]
      }
      }, {dy: -itemHeight});
  });

  it('should select last three items and move them up one position (drag on 2nd item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 2, values, {dy: itemHeight*2}, true);

    expect(element('.ui-selected').count()).toBe(3);

    testDrag(1, 3, {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4,1]
      }
      }, {dy: -itemHeight*2});
  });

  it('should select last three items and move them up one position (drag on 3rd item)', function() {
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4]
      }
    };
    testDrag(1, 2, values, {dy: itemHeight*2}, true);

    expect(element('.ui-selected').count()).toBe(3);

    testDrag(1, 4, {
      0: {
        before: [1,2,3,4],
        after:  [2,3,4,1]
      }
      }, {dy: -itemHeight*3});
  });

  it('should filter and select "B" items and move them to second column before "B" item', function() {
    input('search').enter('B');
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4],
        htmlBefore: [2,4],
        htmlAfter: [2,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 1, {
      0: {
        before: [1,2,3,4],
        after:  [1,3],
        htmlBefore: [2,4],
        htmlAfter: []
      },
      1: {
        before: [5,6,7],
        after:  [5,2,4,6,7],
        htmlBefore: [6],
        htmlAfter: [2,4,6]
      }
      }, {dx: itemWidth});

      input('search').enter('');
      testItemHtml(1, [1,3]);
      testItemHtml(2, [5,2,4,6,7]);
  });

  it('should filter and select "B" items and move them to second column before "B" item (drag on 2nd item)', function() {
    input('search').enter('B');
    var values = {
      0: {
        before: [1,2,3,4],
        after:  [1,2,3,4],
        htmlBefore: [2,4],
        htmlAfter: [2,4]
      }
    };
    testDrag(1, 1, values, {dy: itemHeight}, true);

    expect(element('.ui-selected').count()).toBe(2);

    testDrag(1, 2, {
      0: {
        before: [1,2,3,4],
        after:  [1,3],
        htmlBefore: [2,4],
        htmlAfter: []
      },
      1: {
        before: [5,6,7],
        after:  [5,2,4,6,7],
        htmlBefore: [6],
        htmlAfter: [2,4,6]
      }
      }, {dx: itemWidth, dy: -itemHeight});

      input('search').enter('');
      testItemHtml(1, [1,3]);
      testItemHtml(2, [5,2,4,6,7]);
  });
  


});
