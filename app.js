(function(){
	angular.module('dictionaryApp',['LocalStorageModule'])
	.controller('dictionaryController', function($scope, $http){

	//console.log("Controller was loaded succesfully");

	var base_url = "https://od-api.oxforddictionaries.com/api/v1";

	$scope.init = function init(){
		//console.log("init() was called");
		$scope.search = null;
		$scope.validFlag = false;
		$scope.showFlag = true;
		$scope.wordNotFound = false;
	}

	$scope.validateInput = function validateInput(){
		//console.log("validateInput was called");
		$scope.showFlag = false;
		var searchTerms = $scope.search.split(" ");

		if($scope.search === undefined || $scope.search === '' || $scope.search === null){
			$scope.validFlag = false;
		}
		else if($scope.search.length && searchTerms.length > 1){
			//Validate for a single word
			$scope.errorMessage= "We currently are a single word dictionary. Please bear with us till our search monkeys become smart enough";
			$scope.wordNotFound = true;
			$scope.validFlag = false;
		}
		else{
			$scope.validFlag = true;
			$scope.wordNotFound = false;
		}
		
		//console.log("Value of validFlag: ",$scope.validFlag);

		return $scope.validFlag;
	};

	$scope.searchApi = function searchApi(){
		
		//console.log("SearchAPI was called");

		var merriamURL = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/'+$scope.search+'?key=1743f7d3-3c20-426e-9b9a-d27c25c0806d';
		var pearsonURL = 'https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword='+$scope.search+'&apikey=4W4QfkL0w0RDEkQyEQo2GBIEJnwGeGiZ';

		$http({
			method: 'GET',
			url: pearsonURL,
		})

		.then(function successCallBack(response){
			//console.log("Response received successfully: ",typeof response.data);
			//console.log('Data received :', response.data.results);
			$scope.dataDump = response.data;
			$scope.data = angular.fromJson($scope.dataDump);
			$scope.showResult($scope.data);
			//console.log('definition :', $scope.definition);

		}, function errorCallBack(response){
			console.log("Response not received");
		});

		$scope.showResult = function(data){
			//console.log("showResult was called !");
			$scope.wordArray = [];
			$scope.wordNotFound = false;

			if(data.total>0){
				//console.log("No of result: ", data.total);
				//console.log("result: "+data.results[1].senses[0].definition[0]);

				//Adding all the wordObjects to wordArray
				for(var wordCount = 0; wordCount<data.total; wordCount++){
					//Initialising Variables
					$scope.wordObject = {};
					$scope.word = null;
					$scope.exampleText = null;
					$scope.def = null;
					//Fetch headword
					$scope.word = data.results[wordCount].headword;
					//Fetch Definition
					$scope.def = data.results[wordCount].senses[0].definition[0];
					//Fetch example text
					if(data.results[wordCount].senses[0].collocation_examples){
						$scope.exampleText = data.results[wordCount].senses[0].collocation_examples[0].example.text;
					}
					else if(data.results[wordCount].senses[0].gramatical_examples){
						$scope.exampleText = data.results[wordCount].senses[0].gramatical_examples[0].examples[0].text;
					}
					else if(data.results[wordCount].senses[0].examples){
						$scope.exampleText = data.results[wordCount].senses[0].examples[0].text;
					}
					else{
						$scope.exampleText = "Sorry, no example available";
					}
					//Create wordObject
					$scope.wordObject = {
						'headword':$scope.word,
						'definition':$scope.def,
						'example':$scope.exampleText
					};
					//Push word object in WordArray
					//console.log($scope.wordObject.headword, $scope.wordObject.definition,$scope.wordObject.example);
					$scope.wordArray.push($scope.wordObject);
					//console.log("wordArray length",$scope.wordArray.length);
				}

				$scope.showFlag = true;
				$scope.wordNotFound = false;
			}else{
				//Show an error message on screen
				console.log("No result found");
				$scope.showFlag = false;
				$scope.wordNotFound = true;
				$scope.errorMessage = "Sorry, we cannot quench your thirst for knowledge. No traces of '"+$scope.search+"' were found in the known universe of dictionaries";
			}

			//console.log("Value of showFlag: ", $scope.showFlag);
			return $scope.showFlag;
		};

	};

	});
})();