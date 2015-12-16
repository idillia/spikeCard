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
        el.style.marginLeft = -70.5;
        lastResizedWidth = window.innerWidth;
      });
    }
  }
  resize();

  angular.module('bridgeApp', [])
  .directive('btnAttrClick', ['gameState', function(gameState){
    return {
      link: function(scope, element, attr) {
        element.on('click', function(){
          gameState.trumpSuit = attr.class;
        })
      }
    }
  }])

  .factory('gameState', function(){
    return {
      trumpSuit: null
    }
  })
  .controller('cardsCtrl', ['$scope', 'gameState', function($scope, gameState){
    // console.log(gameState);
    var zIdx = 0;
    // var east = [], west= [], south = [], north =[];  
    var Card = function(value, rank, suit, zIndex, dir) {
      this.value = value;
      this.rank = rank;
      this.suit = suit;
      this.zIndex = zIndex || 0;
      this.dir = dir;
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

    var Position = function(n,s,e,w){ 
      this.n = n;
      this.s = s;
      this.e = e;
      this.w = w;
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
        position.e = new Hand();
        position.e.cards = this.cards.slice(0,13);
        position.e.sort();

        position.w = new Hand();
        position.w.cards = cards.slice(13,26);
        position.w.sort();
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

    console.log($scope.deck);

    
    $scope.selectCardNorth = function(aCard) {
      $scope.chosenCardNorth = $scope.deck.n.cards.splice(aCard,1); 
      $scope.chosenCardNorth[0].zIndex = zIdx++;
      console.log(aCard);
    }

    $scope.selectCardEast = function(aCard) {
      $scope.chosenCardEast = $scope.deck.e.cards.splice(aCard,1);
      $scope.chosenCardEast[0].zIndex = zIdx++;
      console.log(aCard);

    }

    $scope.selectCardWest = function(aCard) {
      $scope.chosenCardWest = $scope.deck.w.cards.splice(aCard,1);
      $scope.chosenCardWest[0].zIndex = zIdx++;
      console.log(aCard);

    }

    $scope.selectCardSouth = function(aCard) {
      $scope.chosenCardSouth= $scope.deck.s.cards.splice(aCard,1);
      $scope.chosenCardSouth[0].zIndex = zIdx++;
      console.log(aCard);

    }
      

    $scope.score = {ns: 0, ew: 0};
    $scope.takeTrick = function() {
      var winningPair = winningTrick(gameState);
      if (winningPair == 'nW' || winningPair == 'sW') {
         $scope.score.ns++;
      } else {
         $scope.score.ew++;
      }
      $scope.chosenCardNorth = '';
      $scope.chosenCardEast = '';
      $scope.chosenCardWest = '';
      $scope.chosenCardSouth = '';
      zIdx=0;
    }     
  }])
  .directive('myCard', function(){
    return {
      template: '<img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: relative;" ng-repeat="card in chosenCardWest"><img src="img/cards/{{card.value}}.svg" style=" top: -30px; width:100px; z-index: {{card.zIndex}}; position: relative; left:-40px;" ng-repeat="card in chosenCardNorth"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: relative; top: -10px; left:-95px;" ng-repeat="card in chosenCardEast"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: relative; top: 40px; left:-250px;" ng-repeat="card in chosenCardSouth">'
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







