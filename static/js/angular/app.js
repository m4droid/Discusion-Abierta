'use strict';

angular.module('DiscusionAbiertaApp', ['ngMaterial'])
  .config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
  });
