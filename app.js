(function(){
	angular.module('dictionaryApp',[])
	.controller('dictionaryController', function($scope, $http){

	console.log("Controller was loaded succesfully");

	$scope.init = function init(){
		//console.log("init() was called");
		$scope.search = "Entrepreneur";
		$scope.validFlag = true;
	}

	$scope.validateInput = function validateInput(){
		//console.log("validateInput was called");

		if($scope.search === undefined || $scope.search === '' || $scope.search === null){
			$scope.validFlag = false;
		}
		else{
			$scope.validFlag = true;
		}
		
		console.log("Value of validFlag: ",$scope.validFlag);
		return $scope.validFlag;
	};

	$scope.searchApi = function searchApi(){
		fetch();
	};

	});
})();