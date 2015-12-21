document.addEventListener("DOMContentLoaded", function(event) { 
  var lastResizedWidth = 0;
  window.onresize = resize;
  function resize() {
    var svgCard;
    svgCard = document.getElementsByClassName("playing-svg-card");
    svgCard = Array.prototype.slice.call(svgCard);
    // console.log(svgCard);
    if(Math.abs(window.innerWidth - lastResizedWidth) > 50) {
      svgCard.forEach(function(el, i, arr) {
        el.style.width = window.innerWidth/20;
        el.style.height = window.innerWidth/15;
        el.style.marginLeft = -70.5 + "px";
        lastResizedWidth = window.innerWidth;
      });
    }
  }
  resize();

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
    }
  }])
  .factory('gameState', function(){
    return {
      trumpSuit: null
      // position: null
    }
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
    console.log(JSON.stringify($scope.deck));
    setPosition($scope.deck);

    $scope.selectCardNorth = function(aCard) {
      $scope.chosenCardNorth = $scope.deck.n.cards.splice(aCard,1);
      $scope.chosenCardNorth[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardNorth);
    }

    $scope.selectCardEast = function(aCard) {
      $scope.chosenCardEast = $scope.deck.e.cards.splice(aCard,1);
      $scope.chosenCardEast[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardEast); 
    }

    $scope.selectCardWest = function(aCard) {
      $scope.chosenCardWest = $scope.deck.w.cards.splice(aCard,1);
      $scope.chosenCardWest[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardWest);
    }
    
    $scope.selectCardSouth = function(aCard) {
      $scope.chosenCardSouth= $scope.deck.s.cards.splice(aCard,1);
      $scope.chosenCardSouth[0].zIndex = zIdx++;
      $scope.trick.push($scope.chosenCardSouth);
      var be = _.flatten($scope.trick);
      console.log(JSON.stringify(be));
    }  

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
    } 

    $scope.Trick  = function(){   
      console.log("winningTrick ", takeTrick(_.flatten($scope.trick), gameState.trumpSuit))  
    }
  }])
  .directive('myCard', function(){
    return {
      template: '<img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: absolute; top:-10px; left:200px;" ng-repeat="card in chosenCardWest"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: absolute; top: -45px; left:250px;" ng-repeat="card in chosenCardNorth"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: absolute; top: 0px; right:275px;" ng-repeat="card in chosenCardEast"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: absolute; top: 20px; left:250px;" ng-repeat="card in chosenCardSouth">'
    }
  })
  .directive('score', function($compile) {
    return {
      restrict: "E",
      scope: {
        content: '=info'
      },
      template: '<div>North-South: {{content.ns}}, East-West: {{content.ew}}'
    }
  })
});







