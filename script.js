// Figure out how to add zindex to hands
// Fo how to move hands to directives
// Fo how to resize hand cards and trick properly
// Add ability to keep cards closed or open
// Fix arrow to right place when trick is over
// Add positions
// Add ability to add points and caluclate how many tricks could be won
// Add databast to addf premade hands
// Add explonation to how to play cards
// Write rules for playing cards
// Code those rules
// Check proper resizing
// Create lessons
// Create ability to add users
 


document.addEventListener("DOMContentLoaded", function(event) { 
  angular.module('bridgeApp', [])
  .directive('btnTrumpClick', ['gameState', function(gameState){
    return {
      link: function(scope, element, attr) {
        element.on('click', function(){
          console.log("trump called")
          gameState.trumpSuit = attr.class;
          console.log(gameState)
        })
      }
    };
  }])
  .directive('hands', ['gameState', function(gameState){
    return {
      restrict: 'E', 
      // link: function(scope, element, attr) {
      //   console.log(document.getElementsByClassName('playing-svg-card'));
      //   var arr = document.getElementsByClassName('playing-svg-card');
      //   console.log(angular.isArray(arr))
       
      // },   
      templateUrl: 'view/hands.html'
    };
  }])
  .factory('gameState', function(){
    return {
      trumpSuit: null
    };
  })
  .controller('cardsCtrl', ['$scope', 'gameState', function($scope, gameState){
    var zIdx = 0;
    var Card = function(value, rank, suit, zIndex, dir) {
      this.value = value;
      this.rank = rank;
      this.suit = suit;
      this.zIndex = zIndex || 0;
      this.dir = dir || "";
    };

    var Hand = function(cards) {
      this.cards = cards || [];
      this.leader = "w" || "";
      this.declare = "s";
      this.dealer = "s";
      this.push = function(el) {
        this.cards.push(el);
      }
    };

    Hand.prototype.sort = function() {
      var ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"];
      var suits = ["diamonds", "clubs", "hearts", "spades"];

      this.cards.sort(function(a, b) {
        var aValue = ranks.indexOf(a.rank) + suits.indexOf(a.suit) * 13;
        var bValue = ranks.indexOf(b.rank) + suits.indexOf(b.suit) * 13;
        return bValue - aValue;
      });
    };

    var Position = function(n,s,e,w, trick){ 
      this.n = n;
      this.s = s;
      this.e = e;
      this.w = w;
      this.trick;
    }

    var suffleDeck = function() {
      this.ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"];
      this.suits = ["diamonds", "clubs", "hearts", "spades"];
      this.cards = [];
      for (var i = 0; i < this.suits.length; i++) {
        for (var k=0; k < this.ranks.length; k++) {
          cards.push(new Card(this.ranks[k]+"_of_"+this.suits[i], this.ranks[k], this.suits[i]));
        }
      } 
      for (j = 0; j < this.cards.length; j++) {
        var s = Math.floor(Math.random()*this.cards.length);
        var temp = this.cards[j];
        this.cards[j] = this.cards[s];
        this.cards[s] = temp;
      } 
      for (var l = 0; l < this.cards.length; l++){
        var position = new Position();
        position.w = new Hand();
        position.w.cards = this.cards.slice(0,13);
        position.w.sort();
        position.e = new Hand();
        position.e.cards = cards.slice(13,26);
        position.e.sort();
        position.s = new Hand();
        position.s.cards = cards.slice(26,39);
        position.s.sort();
        position.n = new Hand();
        position.n.cards = this.cards.slice(39,52);
        position.n.sort();
      }
      return position;
    }
    $scope.deck = suffleDeck();
    $scope.trick = [];
    $scope.score = {ns: 0, ew: 0};

    var setPosition = function(obj) {
      for (var k in obj) {
        for (var i = 0; i<obj[k].cards.length; i++) {
        obj[k].cards[i].dir = k;
        }
      }
      return obj;
    }
    setPosition($scope.deck);

    // console.log(JSON.stringify($scope.deck));
    var array = []
    $scope.state = { selected: array};

    //TODO: figure out what do I pass as trick instead of $scope.trick.length

    var isTrickOver = function(trick) {
      if ($scope.trick.length === 4) {
        console.log("trick is over");
        var winner = takeTrick(_.flatten($scope.trick), gameState.trumpSuit);
        
        if (winner === "w") {
          $scope.isActiveWest = true;
          $scope.isActiveNorth = false;
          $scope.isActiveEast = false;
          $scope.isActiveSouth = false;
          $scope.state = { selected: array};
        } else if (winner === "n") {
          $scope.isActiveNorth = true;
          $scope.isActiveWest = false;
          $scope.isActiveEast = false;
          $scope.isActiveSouth = false;
          $scope.state = { selected: array};
        } else if (winner === "e") {
          $scope.isActiveWest = false;
          $scope.isActiveNorth = false;
          $scope.isActiveEast = true;
          $scope.isActiveSouth = false;
          $scope.state = { selected: array};
        } else if (winner === "s") {
          $scope.isActiveWest = false;
          $scope.isActiveNorth = false;
          $scope.isActiveEast = false;
          $scope.isActiveSouth = true;
          $scope.state = { selected: array};
        }
      }
      else {
        console.log("trick is NOT over");
        return false;
      }  
    };


    $scope.isActiveWest = false;
    $scope.isActiveNorth = false;
    $scope.isActiveEast = false;
    $scope.isActiveSouth = false;

    //Finding out winning card in a trick    
    var whichLeadingCard = function(trick) {
      var leadingSuit = '';
      for (var key in trick) {
        if (trick[key].zIndex === 0) {
          leadingSuit = trick[key].suit;
        }
     }
      return leadingSuit;
    };
    
    // console.log(whichLeadingCard(hand));
  
    var disableSuits = function(hand) {
      if (!$scope.isActiveWest || !isTrickOver()) {
        var ls = whichLeadingCard(_.flatten($scope.trick));
        // console.log(ls);
        for (var i = 0; i<hand.length; i++) {
          if (hand[i].suit == ls) {
            // console.log(hand[i].suit)
            $scope.state.selected.push(i);
            console.log($scope.state.selected)
          }
        }
      }
       // console.log($scope.state.selected.indexOf()) 
    };

    $scope.inSelectedArray = function(index) {
      if ($scope.state.selected.length > 0) {
        if ($scope.state.selected.indexOf(index) >= 0) {
          console.log("Index is in array. Disable everything else")
          return true;
        }
        else {
          console.log($scope.state.selected);
          console.log("Index is NOT in array. Enable everything!")
          return false;
        }  
      }
      else {
        console.log("Array is empty. Enable everything!")
        return true;
      }
    } 
    
    $scope.selectCardNorth = function(aCard) {
      $scope.chosenCardNorth = $scope.deck.n.cards.splice(aCard,1);
      $scope.chosenCardNorth[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardNorth);
      $scope.isActiveNorth = !$scope.isActiveNorth;
      $scope.isActiveEast = !$scope.isActiveEast;
      isTrickOver();
      array = [];
      $scope.state = { selected: array};
      disableSuits($scope.deck.e.cards);  
      console.log("previous north array is erased", $scope.state.selected)
      
    };

    $scope.selectCardEast = function(aCard) {
      $scope.chosenCardEast = $scope.deck.e.cards.splice(aCard,1);
      $scope.chosenCardEast[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardEast);
      $scope.isActiveEast = !$scope.isActiveEast; 
      $scope.isActiveSouth = !$scope.isActiveSouth;
      isTrickOver(); 
      array = [];
      $scope.state = { selected: array};
      disableSuits($scope.deck.s.cards);  
      console.log("previous east array is erased", $scope.state.selected) 
         
    }

    $scope.selectCardWest = function(aCard) {
      $scope.chosenCardWest = $scope.deck.w.cards.splice(aCard,1);
      $scope.chosenCardWest[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardWest);
      $scope.isActiveWest = !$scope.isActiveWest;
      $scope.isActiveNorth = !$scope.isActiveNorth;
      isTrickOver();
      array = [];
      $scope.state = { selected: array};
      disableSuits($scope.deck.n.cards);
      console.log("previous west array is erased", $scope.state.selected)
     
    }
    
    $scope.selectCardSouth = function(aCard) {
      $scope.chosenCardSouth= $scope.deck.s.cards.splice(aCard,1);
      $scope.chosenCardSouth[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardSouth);
      $scope.isActiveSouth = !$scope.isActiveSouth;    
      $scope.isActiveWest = !$scope.isActiveWest;
      isTrickOver();
      array = []
      $scope.state = { selected: array};
      disableSuits($scope.deck.w.cards);
      console.log("previous south array is erased", "west has: ", $scope.state.selected)
 
      
    }  

    var whichWinnerByRank = function(trick) {
      var max = 0
      var higherRankPosition = '';
      for (var key in trick) {
        var rank = trick[key].rank;
        if (ranks.indexOf(rank) >= max) {
          max = ranks.indexOf(rank);
          higherRankPosition = trick[key];
        } else {
        }
      }    
      return higherRankPosition;
    };
    // console.log("whichWinnerByRank ", whichWinnerByRank(hand));
    var allSuitsEqual = function(trick) {
      var leadingCard = whichLeadingCard(trick);
      var isAllEqual = true;
      for (var key in trick) {
        if (trick[key].suit != leadingCard ) {
          isAllEqual = false;
        }  
      }
      return isAllEqual;
    };
    // console.log("allSuitsEqual ", allSuitsEqual(hand));
    var extractTrumps = function(trick, trump){
      var newTrick = trick;
      for (var key in trick) {
        if (newTrick[key].suit !== trump) {
          delete newTrick[key];
        }
      }
      return newTrick;
    }
    // console.log(extractTrumps(hand, koz));
    var isTrump = function(trick, trump) {
      var isKoz = false;
      for (var key in trick) {
        if (trick[key].suit == trump ) {
          isKoz = true;
        }  
      }
      return isKoz;
    }
    // console.log(isTrump(hand, koz));
    var extractMachedSuits = function(trick) {
      var leadingCard = whichLeadingCard(trick);
      var newTrick = trick;
      for (var key in trick) {
        if (newTrick[key].suit !== leadingCard) {
          delete newTrick[key];
        }
      }
      return newTrick;
    }
    // console.log(extractMachedSuits(hand));

    var takeTrick = function(trick, trump) {
      var winner='';
      if (allSuitsEqual(trick)) {
        winner = whichWinnerByRank(trick);
      } else if (isTrump(trick,trump)) { 
        console.log("trump here");
        var ex = extractTrumps(trick, trump);
        winner = whichWinnerByRank(ex);
      } else {
        console.log(" NO trump here");
        winner = whichWinnerByRank(extractMachedSuits(trick));
      }
      $scope.chosenCardNorth = '';
      $scope.chosenCardEast = '';
      $scope.chosenCardWest = '';
      $scope.chosenCardSouth = '';
      $scope.trick = [];
      zIdx=0;

      if (winner.dir === "s" || winner.dir === "n") {
        $scope.score.ns++;
      } else {
        $scope.score.ew++;
      }
      return winner.dir; 
    }; 

    $scope.Trick  = function(){   
      // TODO: check that lenght should be at least 4 or just call isTrickOver
      isTrickOver();  
    }; 

    var leaderArrow = function() {
      if ($scope.deck.w.leader == "w") {
        $scope.isActiveWest = !$scope.isActiveWest;
      } 
    };
 
    leaderArrow();

         
  }])
  .directive('myCard', function(){
    return {
      template: '<img src="img/cards/{{card.value}}.svg" class="west-trick"; style="z-index: {{card.zIndex}};" ng-repeat="card in chosenCardWest">' + 
                '<img src="img/cards/{{card.value}}.svg" class="north-trick"; style="z-index: {{card.zIndex}};" ng-repeat="card in chosenCardNorth">' +
                '<img src="img/cards/{{card.value}}.svg" class="east-trick"; style="z-index: {{card.zIndex}};" ng-repeat="card in chosenCardEast">' +
                '<img src="img/cards/{{card.value}}.svg" class="south-trick"; style="z-index: {{card.zIndex}};" ng-repeat="card in chosenCardSouth">'
    }
  })
  .directive('score', function($compile) {
    return {
      restrict: "E",
      scope: {
        content: '=info'
      },
      template: '<h3>North-South: {{content.ns}}, East-West: {{content.ew}}</h3>'
    }
  })
});







