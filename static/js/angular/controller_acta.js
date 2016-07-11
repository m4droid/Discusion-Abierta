'use strict';

angular.module('DiscusionAbiertaApp').controller('ActaCtrl', function ($scope) {
  $scope.itemsGroups = [
    {
      nombre: 'VALORES Y PRINCIPIOS',
      descripcion: '¿Cuáles son los VALORES Y PRINCIPIOS más importantes que deben inspirar y dar sustento a la Constitución?',
      items: [
        {nombre: ''}
      ]
    },
    {
      nombre: 'DERECHOS',
      descripcion: '¿Cuáles son los DERECHOS más importantes que la Constitución debiera establecer para todas las personas?',
      items: [
        {nombre: ''}
      ]
    },
    {
      nombre: 'DEBERES Y RESPONSABILIDADES',
      descripcion: '¿Cuáles son los DEBERES Y RESPONSABILIDADES más importantes que la Constitución debiera establecer para todas las personas?',
      items: [
        {nombre: ''}
      ]
    },
    {
      nombre: 'INSTITUCIONES',
      descripcion: '¿Qué INSTITUCIONES debe contemplar la Constitución?',
      items: [
        {nombre: ''}
      ]
    }
  ];
});
