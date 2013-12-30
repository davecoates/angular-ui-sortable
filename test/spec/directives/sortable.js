'use strict';

describe('Directive: uisSortable', function() {
  beforeEach(module('uis'));

  var element, ctrl, scope;
  beforeEach(function() {
    inject(function($compile, $rootScope) {
      scope = $rootScope.$new();
      scope.items = [
        {id: 1},
        {id: 2},
        {id: 3}
      ];
      scope.orderProp = '';
      element = $compile('<div uis-sortable="{connectWith: \'.column\'}"><div ng-repeat="item in items | orderBy: orderProp">item number {{item}}</div></div>')(scope);
    }); 
  });

  it('should instance sortable and identify repeat items', function() {
      expect(element.hasClass("ui-sortable")).toBeTruthy();
      ctrl = element.controller('uisSortable');
      expect(ctrl.valueIdent).toEqual('item');
      expect(ctrl.getCollection()).toEqual(scope.items);
  });

  it('should disable sorting is items are filtered with orderBy', function() {
      var spy = spyOn($.fn, 'sortable');
      scope.orderProp = 'id';
      scope.$apply();
      expect($.fn.sortable).toHaveBeenCalledWith('disable');
      scope.orderProp = '';
      scope.$apply();
      expect($.fn.sortable).toHaveBeenCalledWith('enable');
  });
});
