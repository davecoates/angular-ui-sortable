var demo = angular.module('demo', ['ui']);
demo.controller('DemoCtrl', function($scope) {
	$scope.orderProp = '';

	$scope.columns = [
		{
			label: 'Today',
			tasks: [
				{
					title: 'Write research proposal',
					date: 1363916699745
				},
				{
					title: 'Take out the trash',
					date: 1359550800000
				},
				{
					title: 'Smile more',
					date: 1357550800000
				}
			]
		},
		{
			label: 'Tomorrow',
			tasks: [
				{
					title: 'Write code',
					date: 1364916699745
				},
				{
					title: 'Mow lawn',
					date: 1363936699745
				},
				{
					title: 'Call a man about a dog',
					date: 1363936699745
				}
			]
		},
		{
			label: 'One day',
			tasks: [
				{
					title: 'Write documentation',
					date: 1257550800000
				},
				{
					title: 'Sleep more',
					date: 1247550800000
				}
			]
		}
	];

});
