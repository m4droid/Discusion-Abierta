'use strict';

angular.module('DiscusionAbiertaApp').controller('ActaCtrl', function ($scope, $http, $mdDialog, $mdMedia) {

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

  var DialogErroresCtrl = function ($scope, $mdDialog, errores) {
    $scope.errores = errores;

    $scope.hide = function () {
      $mdDialog.hide();
    };
    $scope.cancel = function () {
      $mdDialog.cancel();
    };
  };

  var confirmarActa = function (ev) {
    var confirm = $mdDialog.prompt()
      .clickOutsideToClose(true)
      .title('Validación del acta')
      .textContent('Antes de enviar el acta se necesita comprobar el número de serie de la cédula de identidad del organizador.')
      .placeholder('Número de serie')
      .ariaLabel('Obtener número de serie')
      .targetEvent(ev)
      .ok('Enviar')
      .cancel('Cancelar');

    $mdDialog.show(confirm).then(function (result) {
      $scope.acta.organizador.serie = result;

      $http({
        method: 'POST',
        url: '/actas/subir/confirmar',
        data: $scope.acta
      }).then(
        function (response) {
          $mdDialog.show($mdDialog.alert()
            .title('Envío del acta')
            .textContent('El acta ha sido enviada con exito.')
            .ariaLabel('Envío del acta')
            .ok('OK')
            .targetEvent(ev));
        },
        function (response) {
           $mdDialog.show($mdDialog.alert()
            .title('Envío del acta')
            .textContent(response.data.mensajes[0])
            .ariaLabel('Envío del acta')
            .ok('OK')
            .targetEvent(ev));
        }
      );
    }, function () {
      $scope.acta.organizador.serie = undefined;
    });
  };

  var mostrarErrores = function (ev, errores) {
    $mdDialog.show({
      controller: DialogErroresCtrl,
      templateUrl: '/static/html/angular/errors.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        errores: errores
      }
    });
  };

  $scope.validarActa = function (ev) {
    $http({
      method: 'POST',
      url: '/actas/subir/validar',
      data: $scope.acta
    }).then(
      function (response) {
        confirmarActa(ev);
      },
      function (response) {
        mostrarErrores(ev, response.data.mensajes);
      }
    );
  };

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
