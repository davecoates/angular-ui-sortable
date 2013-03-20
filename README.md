Angular UI ngRepeat Sortable 
============================

Angular directive that uses jQuery UI sortable and updates a collection defined by ng-repeat. The angular-ui sortable 
works great with ng-model but I needed to be able to filter results and still re-order in a sensible manner.

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
    
The dragged element is placed after the first visible element except in the case where there is none - then it is placed before.

If you apply the orderBy filter as part of the ng-repeat then sorting will be disabled (assuming it's sorting on something).  
