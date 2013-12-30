Angular UI Sortable 
===================

Angular directives that uses jQuery UI sortable and updates a collection 
defined by ng-repeat. A selectable directive is also available to allow 
moving of multiple items together.

The [angular-ui](https://github.com/angular-ui) sortable works great with 
ng-model but not if you want to filter results and still re-order results 
in a sensible manner.

## Directives

Both directives must be applied to an element that also has ng-repeat
applied. Only the array form is supported - (key, value) form is not 
supported as it doesn't have an order.

### Sortable

	<ANY ng-repeat="{repeat_expression}" uis-sortable>

You can pass an object to uis-sortable which will be used to initialised
jQuery UI sortable. The collection identified in repeat_expression will
be modified whenever sorting occurs. Ordering is relative to the item a
dragged element is placed next to. This allows sorting to do something
sensible when a filter has been applied to ng-repeat. See section
below for more details.

### Selectable

	<ANY ng-repeat="{repeat_expression}" uis-selectable>

You can pass an object to uis-selectable which will be used to initialise
jQuery UI selectable. Pass moveWithSortable to make all selected items
move whenever a selected items is dragged using UI sortable.

	<ANY ng-repeat="{repeat_expression}" uis-sortable uis-selectable="{moveWithSortable: true}">

A helper will be supplied if you don't specify one which will show
all selected items as being dragged.


## Sort order when filtering

Works with filtering by positioning element relative to visible items,

    * Anton
    * Benton
    * Constantine
    * Arben
    * Craig
    * Dave
    * Ben
    
If you then apply the filter string 'ben' to get,

    * Benton
    * Arben
    * Ben
    
and drag Ben one spot up 

    * Benton
    * Ben
    * Arben
    
and remove the filter...

    * Anton
    * Benton
    * Ben
    * Constantine
    * Arben
    * Craig
    * Dave
    
The dragged element is placed after the first visible element except in the
case where there is none - then it is placed before.

If you apply the orderBy filter as part of the ng-repeat then sorting will be
disabled (assuming it's actually ordering on something).  
