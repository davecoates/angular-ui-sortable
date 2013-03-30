function testItemHtml(listNumber, values) {
  var query = function(selectedElements, done) {
    var ids = [];
    selectedElements.each(function(_, el) {
      ids.push(el.innerHTML);
    });
    done(null, ids.join(','));
  };
  if (values.length === 0) {
    expect(element('ul#list-'+listNumber+' li .id').count()).toBe(0);
  } else {
    expect(element('ul#list-'+listNumber+' li .id').query(query)).toBe(values.join(','));
  }
}
function testDrag(listNumber, itemNumber, values, dydx, doSelect) {
  

  if (values[0]) {
    testItemHtml(1, values[0].htmlBefore || values[0].before);
  }
  if (values[1]) {
    testItemHtml(2, values[1].htmlBefore || values[1].before);
  }
  dragAndCompare(listNumber, itemNumber, values, dydx, doSelect);

  if (values[0]) {
    testItemHtml(1, values[0].htmlAfter || values[0].after);
  }
  if (values[1]) {
    testItemHtml(2, values[1].htmlAfter || values[1].after);
  }
}
  
