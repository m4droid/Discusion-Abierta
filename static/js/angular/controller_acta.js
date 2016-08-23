'use strict';

var LOCALSTORAGE_ACTA_KEY = 'acta';

angular.module('DiscusionAbiertaApp').controller('ActaCtrl', function ($scope, $http, $mdDialog, localStorageService) {

  $scope.agregarParticipante = function () {
    if ($scope.acta.participantes.length < $scope.acta.max_participantes) {
      $scope.acta.participantes.push({nombre: '', apellido: ''});
    }
  };

  $scope.quitarParticipante = function (index) {
    if ($scope.acta.participantes.length == $scope.acta.min_participantes) {
      return;
    }
    $scope.acta.participantes.splice(index, 1);
  };

  var DialogErroresCtrl = function ($scope, $mdDialog, errores) {
    $scope.errores = errores;

    $scope.close = function () {
      $mdDialog.hide();
    };
  };

  var DialogDisclaimerCtrl = function ($scope, $mdDialog) {

    $scope.aceptamos = false;

    $scope.aceptan = function () {
      $mdDialog.hide();
    };

    $scope.rechazan = function () {
      $mdDialog.cancel();
    };
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

  var confirmarActa = function (ev) {
    $mdDialog.show({
      controller: DialogDisclaimerCtrl,
      templateUrl: '/static/html/angular/disclaimer.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
    }).then(function (result) {
      $http({
        method: 'POST',
        url: '/actas/subir/confirmar',
        data: $scope.acta
      }).then(
        function (response) {
          $mdDialog.show($mdDialog.alert()
            .textContent('El acta ha sido enviada con exito.')
            .ariaLabel('Envío del acta')
            .ok('OK')
            .targetEvent(ev));
          $scope.noValidar = false;
        },
        function (response) {
          mostrarErrores(ev, response.data.mensajes);
          $scope.noValidar = false;
        }
      );
    }, function (result) {
      $scope.noValidar = false;
    });
  };
  $scope.validarActa = function (ev) {
    $scope.noValidar = true;

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
        $scope.noValidar = false;
      }
    );
  };

  var filtrarProvincias = function () {
    $scope.provinciasFiltradas = $scope.provincias.filter(function (provincia) {
      if ($scope.acta.geo.region === undefined) {
        return false;
      }
      return provincia.fields.region === $scope.acta.geo.region;
    });
  };

  var filtrarComunas = function () {
    $scope.comunasFiltradas = $scope.comunas.filter(function (comuna) {
      if ($scope.acta.geo.provincia === undefined) {
        return false;
      }
      return comuna.fields.provincia === $scope.acta.geo.provincia;
    });
  };

  var cargarWatchersGeo = function () {
    $scope.$watch('acta.geo.region', function () {
      if ( ! String($scope.acta.geo.provincia).startsWith(String($scope.acta.geo.region))) {
        delete $scope.acta.geo.provincia;
      }
      if ( ! String($scope.acta.geo.comuna).startsWith(String($scope.acta.geo.provincia))) {
        delete $scope.acta.geo.comuna;
      }
      filtrarProvincias();
    });

    $scope.$watch('acta.geo.provincia', function () {
      if ( ! String($scope.acta.geo.comuna).startsWith(String($scope.acta.geo.provincia))) {
        delete $scope.acta.geo.comuna;
      }
      filtrarComunas();
    });
  };

  var cargarWatchersActa = function () {
    $scope.$watch('acta', function () {
      localStorageService.set(LOCALSTORAGE_ACTA_KEY, $scope.acta);
    }, true);
  };

  var cargarDatos = function () {
    if (localStorageService.get(LOCALSTORAGE_ACTA_KEY) !== null) {
      $scope.acta = localStorageService.get(LOCALSTORAGE_ACTA_KEY);
    } else {
      $http({
        method: 'GET',
        url: '/actas/base'
      }).then(function (response) {
        $scope.acta = response.data;
      });
      console.log($scope.acta)
    }
  };

  $scope.limpiarActa = function (ev) {

    var confirm = $mdDialog.confirm()
      .clickOutsideToClose(true)
      .textContent('¿Estás seguro de que quieres limpiar los datos del acta?')
      .ariaLabel('Limpiar acta')
      .targetEvent(ev)
      .ok('Limpiar')
      .cancel('Cancelar');

    $mdDialog.show(confirm).then(function (result) {
      localStorageService.remove(LOCALSTORAGE_ACTA_KEY);
      cargarDatos();
    });
  };

  $scope.acta = {
    geo: {}
  };
  $scope.toggleView = function(ary, data, index){
    for(var i=0; i<ary.length; i++){
      if(i!=index) { ary[i].expanded=false; }
      else { data.expanded=!data.expanded; }
    }
  }
  $scope.regiones = [];
  $scope.provincias = [];
  $scope.comunas = [];
  $scope.estamentos=[{"name":'Academico'},{"name":'Funcionario'},{"name":'Estudiante'},{"name":'Egresado'}];
  $scope.facultades =[{"name":'Facultad de Arquitectura y Urbanismo'}
    ,{"name": 'Facultad de Ciencias'}
    ,{"name": 'Facultad de Ciencias Químicas y Farmacéuticas'}
    ,{"name": 'Facultad de Derecho'}
    ,{"name": 'Facultad de Medicina'}
    ,{"name": 'Instituto de Comunicación e Imagen'}
    ,{"name": 'Facultad de Artes'}
    ,{"name": 'Facultad de Ciencias Físicas y Matemáticas'}
    ,{"name": 'Facultad de Ciencias Sociales'}
    ,{"name": 'Facultad de Economía y Negocios'}
    ,{"name": 'Facultad de Odontología'}
    ,{"name": 'Instituto de Estudios Internacionales'}
    ,{"name": 'Facultad de Ciencias Agronómicas'}
    ,{"name": 'Facultad de Ciencias Forestales y de la Conservación de la Naturaleza'}
    ,{"name": 'Facultad de Ciencias Veterinarias y Pecuarias'}
    ,{"name": 'Facultad de Filosofía y Humanidades'}
    ,{"name": 'Instituto de Asuntos Públicos'}
    ,{"name": 'Instituto de Nutrición y Tecnología de los Alimentos'}]
  $scope.propuestas=[{"propuesta":"¿Cuáles debieran ser los objetivos de una Reforma a la Educación Superior?\n"},
    {
      "propuesta": "¿Qué funciones debe cumplir unainstitución para ser considerada una universidad?\n¿Cuál debiese ser la relación entre la educación superior y la investigación?\n ¿Debiese haber alguna alusión específica a las universidades regionales?\n",
    },
    {
      "propuesta": "¿Qué principios deben guiar un sistema de educación superior?\n¿Cuál debe ser la relación entre la educación técnico profesional y la universitaria?\n¿Cuál debiese ser la relación entre la educación técnico-profesional y la investigación?\n¿Debiese haber alguna alusión específica a las instituciones regionales?\n",
    },
    {
      "propuesta": "¿Qué debiera entender por institución pública de educación superior?\n¿Qué relación deben tener las Universidades estatales con el Estado?\n¿Cuáles son los principales desafíos institucionales de expandir la matrícula estatal?\n¿Qué funciones y características debiese tener un sistema de universidades y CFT estatales?\n¿Cuál debiese ser el rol de la Universidad de Chile en la construcción y funcionamiento del sistema estatal de educación superior?\n",
    },
    {
      "propuesta": "¿Bajo qué condiciones se justifica que el Estado financie a instituciones de la educación superior?\n¿Debe este financiamiento ser distinto para instituciones estatales y privadas?\n¿Deben financiarse de igual manera todas las labores que realizan las universidades?\n¿Cuál debiera ser el mecanismo definanciamiento de la investigación y la creación artística?\n¿El financiamiento debiese considerar tanto aportes a instituciones como a estudiantes?\n",
    },
    {
      "propuesta": "¿Quiénes deberían ingresar a lau niversidad?\n¿Qué elementos debería considerar y priorizar un eventual mecanismo de acceso general a todas las universidades?\n",
    },
    {
      "propuesta": "¿Es necesario evaluar la calidad?\n¿Cómo se debe evaluar la calidad?\n¿Deben todas las universidades cumplir los mismos estándares?\n¿Debe relacionarse la calidad al financiamiento?\n",
    }
    ,
    {
      "propuesta": "¿Se debe exigir las mismas formas de gobierno a instituciones privadas y estatales?\n¿Qué rol juegan los distintos estamentos en dichas formas de gobierno?\n¿Qué nivel de autonomía deberían tener las universidades?\n¿Debería establecerse alguna diferencia entre universidades estatales y privadas?\n¿Qué mecanismos de rendición de cuentas deben tener las universidades con el Estado?\n ¿Debiesen diferenciarse estos mecanismos según la universidad sea estatal o privada?\n",
    },
    {
      "propuesta": "¿Qué cambios institucionales son necesarios para un nuevo sistema de educación superior?\n",
    },
    {
      "propuesta": "¿Qué mecanismos de transparenciase requieren para que las universidades efectivamente desarrollen las actividades encomendadas por ley?\n",
    }
    ,{
      "propuesta": "¿Debe la ley referirse más detalladamente a los mecanismos de promoción académica y funcionaria enlas instituciones estatales de educación superior?\n¿Debería incluirse alguna referencia alas condiciones laborales de los funcionarios de las instituciones estatales de educación superior?\n¿Debe la ley referirse a este tipo de mecanismos en instituciones privadas?\n",
    }]
  $scope.tipoEncuentro = [{"name":'Encuentro autoconvocado'},{"name":'Encuentro gremial'},{"name":'Encuentro transversal'},{"name":'Encuentro facultad'}]
  cargarWatchersGeo();


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
    filtrarProvincias();
  });

  $http({
    method: 'GET',
    url: '/static/json/comunas.json'
  }).then(function (response) {
    $scope.comunas = response.data;
    filtrarComunas();
  });

  cargarWatchersActa();
  cargarDatos();
});
