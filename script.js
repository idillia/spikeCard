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
    console.log(gameState);
    var zIdx;
    var east = [], west= [], south = [], north =[];  
    var Card = function(value, name, suit, zIndex) {
      this.value= value;
      this.name = name;
      this.suit = suit;
      this.zIndex = zIndex || 0;
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
        var aValue = ranks.indexOf(a.name) + suits.indexOf(a.suit) * 13;
        var bValue = ranks.indexOf(b.name) + suits.indexOf(b.suit) * 13;
        return bValue - aValue;
      });
    };

    var suffleDeck = function(){
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
        east = new Hand();
        east.cards = this.cards.slice(0,13);
        east.sort();
        west = new Hand();
        west.cards = cards.slice(13,26);
        west.sort();
        south = new Hand();
        south.cards = cards.slice(26,39);
        south.sort();
        north = new Hand();
        north.cards = this.cards.slice(39,52);
        north.sort();
      }
      console.log(north);
      return {east, west, south, north};
    }
    $scope.deck = suffleDeck();

    
    $scope.selectCardNorth = function(aCard) {
      $scope.chosenCardNorth = $scope.deck.north.cards.splice(aCard,1); 
      $scope.chosenCardNorth[0].zIndex = zIdx++;
      console.log($scope.chosenCardNorth);
    }

    $scope.selectCardEast = function(aCard) {
      $scope.chosenCardEast = $scope.deck.east.cards.splice(aCard,1);
      $scope.chosenCardEast[0].zIndex = zIdx++;
    }

    $scope.selectCardWest = function(aCard) {
      $scope.chosenCardWest = $scope.deck.west.cards.splice(aCard,1);
      $scope.chosenCardWest[0].zIndex = zIdx++;
    }

    $scope.selectCardSouth = function(aCard) {
      $scope.chosenCardSouth= $scope.deck.south.cards.splice(aCard,1);
      $scope.chosenCardSouth[0].zIndex = zIdx++;
    }

    var winningTrick = function(trump) {
      var ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"];
      var suits = ["diamonds", "clubs", "hearts", "spades"];
      console.log($scope.chosenCardNorth);
      var n = $scope.chosenCardNorth[0];
      var e = $scope.chosenCardEast[0];
      var w = $scope.chosenCardWest[0];
      var s = $scope.chosenCardSouth[0];
      console.log(n.suit, e.name, w, s);
      var winner;
      if (((n.suit == w.suit) && (n.suit == e.suit)) && (n.suit == s.suit)) {
        console.log('all one suit');
        if (ranks.indexOf(n.name) > ranks.indexOf(e.name) && ranks.indexOf(n.name) > ranks.indexOf(w.name) && ranks.indexOf(n.name) > ranks.indexOf(s.name)) {
          winner = 'nW';
        } else if (ranks.indexOf(s.name) > ranks.indexOf(n.name) && ranks.indexOf(s.name) > ranks.indexOf(w.name) && ranks.indexOf(s.name) > ranks.indexOf(e.name)) {
          winner = 'sW';
        } 
        else if (ranks.indexOf(w.name) > ranks.indexOf(n.name) && ranks.indexOf(w.name) > ranks.indexOf(s.name) && ranks.indexOf(w.name) > ranks.indexOf(e.name)) {
          winner = 'wW';
        } else {
          winner = 'eW';
        }
      }
      console.log(gameState);
      console.log(winner);
      return winner;
    } 

    $scope.score = {ns: 0, ew: 0};
    $scope.takeTrick = function() {
      var winningPair = winningTrick();
      if (winningPair == 'nW' || winningPair == 'sW') {
         $scope.score.ns++;
      } else {
         $scope.score.ew++;
      }
      $scope.chosenCardNorth = '';
      $scope.chosenCardEast = '';
      $scope.chosenCardWest = '';
      $scope.chosenCardSouth = '';
    }     
  }])
  .directive('myCard', function(){
    return {
      template: '<img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: relative; left:30px;" ng-repeat="card in chosenCardEast"><img src="img/cards/{{card.value}}.svg" style=" top: -30px; width:100px; z-index: {{card.zIndex}}; position: relative; left:-40px;" ng-repeat="card in chosenCardNorth"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: relative; top: -10px; left:-95px;" ng-repeat="card in chosenCardWest"><img src="img/cards/{{card.value}}.svg" style="width:100px; z-index: {{card.zIndex}}; position: relative; top: 40px; left:-250px;" ng-repeat="card in chosenCardSouth">'
    }
  })
  .directive('score', function($compile) {
    var linker = function(scope, element, attr){
    }
    return {
      restrict: "E",
      link: linker,
      scope: {
        content: '=info'
      },
      template: '<div>North-South: {{content.ns}}, East-West: {{content.ew}}'
    }
  })
});






