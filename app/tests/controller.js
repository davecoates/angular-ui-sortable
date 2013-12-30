function SortableTest($scope) {
  $scope.helper = function(event, element) {
    if (element.hasClass('ui-selected')) {
      element.parent('ul').find('.ui-selected').addClass("ui-sortable-selected");
    }
    return element;
  };

  $scope.items = [
    [ 
    {id: 1, title: 'A'},
    {id: 2, title: 'B'},
    {id: 3, title: 'A'},
    {id: 4, title: 'B'}
  ],
  [ 
    {id: 5, title: 'A'},
    {id: 6, title: 'B'},
    {id: 7, title: 'C'}
  ]
  ];
}
