'use strict';

angular.module('DiscusionAbiertaApp').controller('ActaCtrl', function ($scope, $http) {

  $scope.agregarParticipante = function () {
    if ($scope.acta.participantes.length < 10) {
      $scope.acta.participantes.push({nombre: '', apellido: ''});
    }
  };

  $scope.quitarParticipante = function (index) {
    if ($scope.acta.participantes.length == 4) {
      return;
    }
    $scope.acta.participantes.splice(index, 1);
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

    $http({
      method: 'GET',
      url: '/actas/base'
    }).then(function (response) {
      $scope.acta = response.data;

      $scope.$watch('acta.geo.region', function () {
        $scope.acta.geo.provincia = undefined;
        $scope.acta.geo.comuna = undefined;

        filtrarProvincias();
      });

      $scope.$watch('acta.geo.provincia', function () {
        $scope.acta.geo.comuna = undefined;

        filtrarComunas();
      });
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

  cargarDatos();
});
