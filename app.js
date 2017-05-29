(function(){

	angular.module('dictionaryApp', ['LocalStorageModule'])

	.controller('dictionaryController', [
		"$scope", 
		"$http", 
		"localStorageService",
		function($scope, $http, localStorageService){

			//console.log("Controller was loaded succesfully");

			//Input search term
			$scope.search = null;
			//Validity Flag for input search term
			$scope.validFlag = false;
			//Display Word information if definition is available
			$scope.showFlag = true;
			//Search Word not found flag
			$scope.wordNotFound = false;
			//Check for wordList
			$scope.wordListEmptyFlag = true;
			//String of headwords present in Word List
			var headwordString = [];

			//Arrays for Local Storage
			var wordListJson = [];
			$scope.wordList = [];

			//Intialisation Function
			$scope.init = function init(){
				//Intialising wordList
				$scope.getWordList();
			};

			//Check validity of searchbar input and enable Search button accordingly
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

			//Disable Save button if word already exists in WordList
			$scope.wordAlreadyExist = function wordAlreadyExist(word){
				//console.log("Word already exist was called");
				var wordExistFlag = null;

				//Stores the index of the word if it exist in WordList
				var searchIndex = headwordString.search(word.headword);

				if(searchIndex === -1){
					wordExistFlag = false;
				}else{
					wordExistFlag = true;
				}

				//console.log("Word already exist: ", wordExistFlag);
				return wordExistFlag;
			}

			//Fetches result from Dictionary API
			$scope.searchApi = function searchApi(){
				
				//console.log("SearchAPI was called");
				//var merriamURL = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/'+$scope.search+'?key=1743f7d3-3c20-426e-9b9a-d27c25c0806d';
				
				var pearsonURL = 'https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword='+$scope.search+'&apikey=4W4QfkL0w0RDEkQyEQo2GBIEJnwGeGiZ';
				$scope.loadingFlag = true;

				$http({
					method: 'GET',
					url: pearsonURL,
				}).then(function successCallBack(response){
					//console.log("Response received successfully: ",typeof response.data);
					//console.log('Data received :', response.data.results);
					$scope.dataDump = response.data;
					$scope.data = angular.fromJson($scope.dataDump);
					$scope.showResult($scope.data);
					$scope.loadingFlag = false;
					//console.log('definition :', $scope.definition);

				}, function errorCallBack(response){
					console.log("Response not received");
				});
			};

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

			$scope.getWordList =  function getWordList(){
				//console.log("getWordList");
				//var check ;
				//console.log(check);

				if(localStorageService.get("WordList")){
					$scope.wordList = angular.fromJson(localStorageService.get("WordList"));
					$scope.wordListEmptyFlag = false;
					headwordString = localStorageService.get("headwords");
					//console.log("Word List initialised")
					//console.log(wordList);
				}else{
					$scope.wordList = [];
					$scope.wordListEmptyFlag = true;
					headwordString = "";
					console.log("wordList initialized with null");
				}
			};

			$scope.saveToWordList = function saveToWordList(word){

				if(!$scope.wordList){
					$scope.wordList = [{
						'headword':word.headword,
						'example':word.example,
						'definition':word.definition
					}];
					headwordString = word.headword;
				}else{
					$scope.wordList.push({
						'headword':word.headword,
						'example':word.example,
						'definition':word.definition,
					});
					headwordString = headwordString.concat(word.headword," ");
				}
				
				$scope.setWordList();
				//console.log(word.headword+" was added to wordlist");
			};

			$scope.setWordList = function setWordList(){
				
				wordListJson = angular.toJson($scope.wordList);
				localStorageService.set("WordList", wordListJson);
				localStorageService.set("headwords", headwordString);
				//console.log(headwordString);
				//console.log($scope.wordList);

			};

			$scope.deleteFromWordList = function deleteFromWordList(id){
				
				//console.log("Index in headwordString", headwordString.indexOf($scope.wordList[id].headword));
				var str = $scope.wordList[id].headword;
				headwordString = headwordString.replace(str,"");
				$scope.wordList.splice(id,1);
				$scope.setWordList();


				if(headwordString !== ""){
					$scope.wordListEmptyFlag = false;
				}else{
					$scope.wordListEmptyFlag = true;
				}
				console.log("wordList Empty: ",$scope.wordListEmptyFlag);
			};
		}
	]);
})();