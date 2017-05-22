(function(){

	var dictionaryApp = angular.module('dictionaryApp', ['LocalStorageModule','ui.bootstrap']);

	dictionaryApp.controller('dictionaryController', [
		"$scope", 
		"$http", 
		"localStorageService",
	function($scope, $http, localStorageService){

	console.log("Controller was loaded succesfully");

	//Input search term
	$scope.search = null;
	//Validity Flag for input search term
	$scope.validFlag = false;
	$scope.showFlag = true;
	$scope.wordNotFound = false;
	$scope.wordListEmptyFlag = true;

	//Arrays for Local Storage
	var wordListJson = [];
	$scope.wordList = [];

	$scope.getWordList =  function getWordList(){
		//console.log("getWordList");

		if(localStorageService.get("WordList")){
				$scope.wordList = angular.fromJson(localStorageService.get("WordList"));
				$scope.wordListEmptyFlag = false;
				//console.log("Word List initialised")
			}else{
				$scope.wordList = [];
				$scope.wordListEmptyFlag = true;
				console.log("wordList initialized with null");
			}
	};

	//Intialising wordList
	$scope.getWordList();

	//Intialisation Function
	$scope.init = function init(){
		//console.log("init() was called");
		//console.log(typeof getWordList());
		//$scope.getWordList();

	};

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
			$scope.wordNotFound = true;
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
					var wordObject = {};
					var word = null;
					var exampleText = null;
					var def = null;
					//Fetch headword
					word = data.results[wordCount].headword;
					//Fetch Definition
					def = data.results[wordCount].senses[0].definition[0];
					//Fetch example text
					if(data.results[wordCount].senses[0].collocation_examples){
						exampleText = data.results[wordCount].senses[0].collocation_examples[0].example.text;
					}
					else if(data.results[wordCount].senses[0].gramatical_examples){
						exampleText = data.results[wordCount].senses[0].gramatical_examples[0].examples[0].text;
					}
					else if(data.results[wordCount].senses[0].examples){
						exampleText = data.results[wordCount].senses[0].examples[0].text;
					}
					else{
						exampleText = "Sorry, no example available";
					}
					//Create wordObject
					wordObject = {
						'headword':word,
						'definition':def,
						'example':exampleText
					};
					//Push word object in WordArray
					//console.log($scope.wordObject.headword, $scope.wordObject.definition,$scope.wordObject.example);
					$scope.wordArray.push(wordObject);
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

		$scope.saveToWordList = function saveToWordList(word){

			$scope.wordList.push({
				'headword':word.headword,
				'example':word.example,
				'definition':word.definition
			});
			wordListJson = angular.toJson($scope.wordList);
			localStorageService.set("WordList", wordListJson);

			if($scope.wordList){
				$scope.wordListEmptyFlag = false;
			}else{
				$scope.wordListEmptyFlag = true;
			}
			//console.log(word.headword+" was added to wordlist");
		};

		$scope.setWordList = function setWordList(){

			$scope.wordListJson = angular.toJson($scope.wordList);
			localStorageService.set("WordList", wordListJson);
		};

		$scope.deleteFromWordList = function deleteFromWordList(id){
			console.log("delete list was called");
			$scope.wordList.splice(id,1);
			$scope.setWordList();
		};

	};

	}]);

	dictionaryApp.controller("modalController", [
		"$uibModal",
		"$document",
		function($uibModal,$document){

		//console.log("Modal controller has been loaded");
		var $ctrl = this;

		$ctrl.animationsEnabled = true;

		$ctrl.open = function(size,parentSelector){
			var parentElem = parentSelector ?
				angular.element($document[0].querySelector('.modal'+parentSelector)) : undefined;

			var modalInstance = $uibModal.open({
				animation: $ctrl.animationsEnabled,
				ariaLabelledBy: 'modal-title',
				ariaLabelledBy: 'modal-body',
				templateUrl: 'wordlist.html',
				controller: 'ModalInstanceCtrl',
				controllerAs: '$ctrl',
				size: size,
				appendTo: parentElem
			});
		}
	}]);
})();