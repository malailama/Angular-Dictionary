(function(){
	angular.module('dictionaryApp',[])
	.controller('dictionaryController', function($scope, $http){

	console.log("Controller was loaded succesfully");

	var base_url = "https://od-api.oxforddictionaries.com/api/v1";

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
		
		//console.log("Value of validFlag: ",$scope.validFlag);
		return $scope.validFlag;
	};

	$scope.searchApi = function searchApi(){

		console.log("SearchAPI was called");

		var merriamURL = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/'+$scope.search+'?key=1743f7d3-3c20-426e-9b9a-d27c25c0806d';
		var pearsonURL = 'https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword='+$scope.search+'&apikey=4W4QfkL0w0RDEkQyEQo2GBIEJnwGeGiZ';

		$http({
			method: 'GET',
			url: pearsonURL,
		})
		.success(function(response){
			$scope.data = response.data;
			$scope.details = angular.fromJson($scope.data);
			console.log("Data received successfully", $scope.details);
		});
	};

	//function fetch(){
	//	console.log("fetch was called");
	//	$http.get("https://od-api.oxforddictionaries.com/api/v1/entries/en/city")
	//	.then(function successCallback(response) {
	//		console.log("Successful response");
	//		$scope.meaning =response.data;
	//		});
	//	};

	});
})();