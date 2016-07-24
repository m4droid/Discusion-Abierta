'use strict';

angular.module('DiscusionAbiertaApp').controller('ActaCtrl', function ($scope, $http) {

  $scope.agregarParticipante = function () {
    if ($scope.participantes.length < 10) {
      $scope.participantes.push({nombre: '', apellido: ''});
    }
  };

  $scope.quitarParticipante = function (index) {
    if ($scope.participantes.length == 4) {
      return;
    }
    $scope.participantes.splice(index, 1);
  };

  $scope.subirActa = function () {
    $http({
      method: 'POST',
      url: '/actas/subir/data',
      data: $scope.acta
    }).then(function (response) {
      // Si todo salio bien
    });
  }

  var filtrarProvincias = function () {
    $scope.provinciasFiltradas = $scope.provincias.filter(function (provincia) {
      if ($scope.acta.geo.region === undefined) {
        return false;
      }
      return provincia.fields.region === $scope.acta.geo.region.pk;
    });
  };

  var filtrarComunas = function () {
    $scope.comunasFiltradas = $scope.comunas.filter(function (comuna) {
      if ($scope.acta.geo.provincia === undefined) {
        return false;
      }
      return comuna.fields.provincia === $scope.acta.geo.provincia.pk;
    });
  };

  var cargarDatos = function () {
    $scope.provincias = [];
    $scope.comunas = [];

    $scope.$watch('acta.geo.region', function () {
      $scope.acta.geo.provincia = undefined;
      $scope.acta.geo.comuna = undefined;

      filtrarProvincias();
    });

    $scope.$watch('acta.geo.provincia', function () {
      $scope.acta.geo.comuna = undefined;

      filtrarComunas();
    });

    $http({
      method: 'GET',
      url: '/static/json/regiones.json'
    }).then(function (response) {
      $scope.regiones = response.data;
    });

    $http({
      method: 'GET',
      url: '/static/json/provincias.json'
    }).then(function (response) {
      $scope.provincias = response.data;
    });

    $http({
      method: 'GET',
      url: '/static/json/comunas.json'
    }).then(function (response) {
      $scope.comunas = response.data;
    });
  };

  $scope.acta = {};

  $scope.acta.geo = {};
  $scope.acta.organizador = {};
  $scope.acta.participantes = [{}, {}, {}, {}];

  $scope.acta.itemsGroups = [
    {
      nombre: 'EDUCACIÓN PÚBLICA',
      descripcion: '¿Cuáles son los VALORES Y PRINCIPIOS más importantes que deben inspirar y dar sustento a la educación pública?',
      items: [
        {nombre: 'Principio A'},
        {nombre: 'Principio B'},
        {nombre: 'Principio C'},
      ]
    },
    {
      nombre: 'DERECHOS',
      descripcion: '¿Cuáles son los DERECHOS más importantes que la educación pública debiera establecer para todas las personas?',
      items: [
        {nombre: 'Principio D'},
        {nombre: 'Principio E'},
        {nombre: 'Principio F'},
      ]
    },
    // {
    //   nombre: 'DEBERES Y RESPONSABILIDADES',
    //   descripcion: '¿Cuáles son los DEBERES Y RESPONSABILIDADES más importantes que la Constitución debiera establecer para todas las personas?',
    //   items: [
    //     {nombre: ''}
    //   ]
    // },
    // {
    //   nombre: 'INSTITUCIONES',
    //   descripcion: '¿Qué INSTITUCIONES debe contemplar la Constitución?',
    //   items: [
    //     {nombre: ''}
    //   ]
    // }
  ];

  cargarDatos();
});
