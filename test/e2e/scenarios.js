describe('uisRepeatSortable directive', function() {

  var itemHeight = 20, itemWidth = 100;
    
  /**
   * Each test starts with visiting test.html
   */
  beforeEach(function() {
    browser().navigateTo('/test/e2e/test.html');
  });

  // =========================================================================

  it('should move first item down current list 1 position at a time', function() {
    testDrag(1, 1,
                   { 0: { 
                     before: [1,2,3,4], 
                     after:  [2,1,3,4] } 
                   },
                   {dy: itemHeight}
                  );

    testDrag(1, 2,
                   { 0: { 
                     before: [2,1,3,4], 
                     after:  [2,3,1,4] } 
                   },
                   {dy: itemHeight}
                  );

    testDrag(1, 3,
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
    testDrag(1,1, values, {dy: itemHeight * 3});
  });

  it('should move last item up current list 1 position at a time', function() {
    testDrag(1, 4,
                   { 0: { 
                     before: [1,2,3,4], 
                     after:  [1,2,4,3] } 
                   },
                   {dy: -itemHeight}
                  );

    testDrag(1, 3,
                   { 0: { 
                     before: [1,2,4,3], 
                     after:  [1,4,2,3] } 
                   },
                   {dy: -itemHeight}
                  );

    testDrag(1, 2,
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
    testDrag(1, 4, 0, {dy: -itemHeight*3});
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
    testDrag(1, 1, values, {dx: itemWidth});
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
    testDrag(1, 1, values, {dx: itemWidth, dy:itemHeight});
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
    testDrag(1, 1, values, {dx: itemWidth});

    testDrag(2, 1, {
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


describe('uiRepeatSortable directive with filtering', function() {

  var itemHeight = 20, itemWidth = 100;
    
  /**
   * Each test starts with visiting test.html
   */
  beforeEach(function() {
    browser().navigateTo('/test/e2e/test.html');
  });

  // =========================================================================

  it('should move first item down 1 then up 1', function() {
    input('search').enter('A');
    testDrag(1, 1,
                   { 0: { 
                     before: [1,2,3,4], 
                     after:  [2,3,1,4],
                     htmlBefore: [1,3],
                     htmlAfter: [3,1]
                   } 
                   },
                   {dy: itemHeight}
                  );

    testDrag(1, 2,
                   { 0: { 
                     before: [2,3,1,4], 
                     after:  [2,1,3,4],
                     htmlBefore: [3,1],
                     htmlAfter: [1,3]
                   } 
                   },
                   {dy: -itemHeight}
                  );

    // Remove filter and check HTML order is what we expect
    input('search').enter('');
    testItemHtml(1, [2,1,3,4]);

  });

  it('should move item from list 1 to list 2', function() {
    input('search').enter('B');
    testDrag(1, 1,
                   { 0: { 
                     before: [1,2,3,4], 
                     after:  [1,3,4],
                     htmlBefore: [2,4],
                     htmlAfter: [4]
                   },
                   1: {
                     before: [5,6,7], 
                     after:  [5,2,6,7],
                     htmlBefore: [6],
                     htmlAfter: [2,6]
                   }
                   },
                   {dx: itemWidth}
                  );

    testDrag(2, 1,
                   { 0: { 
                     before: [1,3,4], 
                     after:  [1,3,2,4],
                     htmlBefore: [4],
                     htmlAfter: [2,4]
                   }, 
                   1: {
                     before: [5,2,6,7], 
                     after:  [5,6,7],
                     htmlBefore: [2,6],
                     htmlAfter: [6]
                   }
                   },
                   {dx: -itemWidth}
                  );

    // Remove filter and check HTML order is what we expect
    input('search').enter('');
    testItemHtml(1, [1,3,2,4]);
  });

});
