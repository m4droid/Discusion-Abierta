'use strict';

var LOCALSTORAGE_ACTA_KEY = 'acta';

var app =angular.module('DiscusionAbiertaApp');
app.controller('ActaCtrl', function ($scope, $http, $mdDialog, localStorageService) {

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
  $scope.estamentos=[{"name":'Academica(o)'},{"name":'Funcionaria(o)'},{"name":'Estudiante'},{"name":'Egresada(o)'}];
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
      "propuesta": "¿Qué funciones debe cumplir una institución para ser considerada una universidad?\n¿Cuál debiese ser la relación entre la educación superior y la investigación?\n ¿Debiese haber alguna alusión específica a las universidades regionales?\n",
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
      "propuesta": "¿Quiénes deberían ingresar a la universidad?\n¿Qué elementos debería considerar y priorizar un eventual mecanismo de acceso general a todas las universidades?\n",
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
  $scope.contextualizaciones =[[{"data" : "El mensaje del proyecto presenta un breve diagnóstico sobre el sistema y sus objetivos:<p>Desde la reforma universitaria de 1981 la educación superior en Chile ha estado en un continuo tránsito pro-mercado, en donde la matrícula universitaria y técnico-profesional ha aumentado explosivamente a través de la proliferación de un sinnúmero de institucionesprivadas y un estancamiento de la participación estatal en el sector. </p><p>Dicho aumento de la matrícula ha sido totalmente desregulado, con bajos estándares de calidad y además ha desembocado en un endeudamiento considerable de los estudiantes y sus familias.</p> <p>De esta manera, hoy en día no existe un sistema sino que solamente un mercado de la educación superior, donde conviven instituciones de distinta naturaleza y calidad, y en la que el carácter de lo público se ha ido diluyendo.En términos generales el proyecto busca garantizar la calidad, la equidad y la inclusión, y la pertinencia del quehacer de la educación superior. </p><p>En particular, los objetivos que el proyecto declara son:</p><p>(1) Consolidar un Sistema de Educación Superior;</p><p>(2) Dar garantías de calidad y resguardo de la fe pública;</p><p>(3) Promover la equidad e inclusión;</p><p>(4) Fortalecer la educación superior estatal;</p><p>(5) Fortalecer la formación técnico profesional</p>"}],
[{"data" : "<p>El título I del proyecto presenta las disposiciones generales del Sistema propuesto.</p><p>El artículo 2° define el Sistema de Educación Superior como un &quot;Sistema de provisión mixta, comprendiendo instituciones de educación superior creadas por ley, y aquellas reconocidas oficialmente por el Estado. Asimismo, dentro de las instituciones de educación superior, se reconocen dos subsistemas, el universitario y el técnico profesional.&quot;</p> <p>El artículo 3° plantea que el Sistema de Educación Superior se inspira en los siguientes principios: </p><p>a) Autonomía; </p><p>b) Calidad; </p><p>c) Diversidad de Proyectos Educativos Institucionales; </p><p>d) Inclusión; </p><p>e) Libertad Académica; </p><p>f) Participación; </p><p>g) Pertinencia; </p><p>h) Respeto y promoción por los Derechos Humanos; </p><p>i) Transparencia; </p><p>j) Trayectorias formativas y articulación.</p> <p>El artículo 8° crea la Subsecretaría de Educación Superior, a cargo del   &quot;Subsecretario o Subsecretaria de Educación Superior (en adelante el &quot;Subsecretario o Subsecretaria &quot;), quien tendrá el carácter de colaborador o colaboradora directa del Ministro o Ministra de Educación en la elaboración, coordinación, ejecución y evaluación de políticas para la educación superior, especialmente en materias destinadas a su desarrollo, promoción y mejoramiento continuo, tanto en el subsistema universitario como en el técnico profesional.&quot;</p>"}],
[{"data" : "El artículo 4° plantea:<p>&quot;Las universidades son instituciones de educación superior cuyamisión es cultivar las ciencias, las humanidades, las artes y las tecnologías, así comotambién crear, preservar y transmitir conocimiento, y formar graduados y profesionales.Corresponde a las universidades contribuir al desarrollo de la cultura y la satisfacción delos intereses y necesidades del país y sus regiones. Éstas cumplen con su misión a travésde la realización de docencia, investigación, creación artística, innovación y vinculacióncon el medio.La formación de graduados y profesionales se caracteriza por una orientación hacia labúsqueda de la verdad y hacia la capacidad de desarrollar pensamiento autónomo ycrítico sobre la base del conocimiento fundamental de las disciplinas.&quot;</p>"}],
[{"data" : "<p>El artículo 5° del proyecto de ley establece: &quot;Los institutos profesionales son instituciones de educación superior cuya misión es la formación de profesionales capaces de contribuir al desarrollo de los distintos sectores productivos y sociales del país. Cumplen su misión a través de la realización de la docencia, la innovación y la vinculación con el medio con un alto grado de pertinencia al territorio donde se emplazan. Asimismo, les corresponde articularse especialmente con la formación técnica de nivel superior y vincularse con el mundo del trabajo para contribuir a la satisfacción de los intereses y necesidades del país y sus regiones. Dicha formación se caracteriza por la obtención de los conocimientos y competencias requeridas para participar y desarrollarse en el mundo del trabajo con autonomía en el ejercicio de una profesión o actividad y con capacidad de innovar.&quot;</p> <p>El artículo 6° plantea: &quot;Los centros de formación técnica son instituciones de educación superior cuya misión es la formación de técnicos altamente calificados en áreas pertinentes al desarrollo de los distintos sectores productivos y sociales. Cumplen su misión a través de la formación y la innovación en el ámbito técnico. Asimismo, les corresponde articularse especialmente con el nivel de enseñanza media en su formación técnico profesional y vincularse con el mundo del trabajo, para contribuir a la satisfacción de los intereses y necesidades del país y sus regiones. Esta formación es de ciclo corto, en conformidad al decreto con fuerza de ley N° 2, de 2009, del Ministerio de Educación, y se caracteriza por entregar los conocimientos y competencias requeridas para participar y desarrollarse en el mundo del trabajo en forma idónea y facilitar el reconocimiento de la experiencia laboral como parte del proceso de formación continua.&quot; </p><p>Posteriormente, el artículo 19° expresa: &quot;Se entenderá por formación técnico profesional todo proceso de enseñanza de carácter formal y no formal, que contemple el estudio de las tecnologías y las ciencias relacionadas, el desarrollo de aptitudes, competencias, habilidades y conocimientos relacionados a ocupaciones en diversos sectores económicos. Deberá promover el aprendizaje permanente de las personas y su integración en la sociedad. </p><p>En el ámbito de la enseñanza formal, la formación técnico profesional considera los niveles de educación media de formación técnico profesional y el nivel de educación superior técnico profesional, así como la modalidad de educación de adultos en el nivel de educación media técnico profesional. En el ámbito de la enseñanza no formal considera todo tipo de formación orientada al mundo del trabajo. Asimismo, contempla todos aquellos mecanismos que faciliten la articulación entre ambos tipos de enseñanza, permitiendo la conformación de trayectorias educativas y laborales.&quot; </p><p>El artículo 20° sostiene que &quot;el Ministerio de Educación establecerá la Estrategia Nacional de Formación Técnico Profesional que orientará el desarrollo e implementación de las políticas públicas que se definan en esta materia, debiendo ser revisada y actualizada cada cinco años. La Estrategia fortalecerá la articulación entre el sistema educativo y el mundo del trabajo, facilitando la formación para el trabajo y la construcción de trayectorias formativas y laborales coherentes y pertinentes a las necesidades de las personas, de los sectores productivos y de la sociedad en general.&quot;</p><p> Finalmente, el artículo 21° plantea que para elaborar esta Estrategia, el &quot;Presidente o Presidenta de la República establecerá mediante decreto supremo un Consejo Asesor de Formación Técnico Profesional, integrado por los Ministros o Ministras de Estado con competencia en la materia, representantes de las organizaciones de empleadores y de trabajadores con mayor representatividad del país, representantes de instituciones educativas y expertos de reconocida experiencia en materia de formación técnico profesional.&quot;</p>"}],
[{"data" : "<p>El título VI del proyecto de Ley versa sobre la Educación Superior Estatal. </p><p>El artículo 141° plantea que &quot;las universidades y centros de formación técnica estatales, tienen como misión contribuir al cumplimiento del deber del Estado de fomentar el desarrollo de la educación en todos sus niveles, estimular la investigación científica y tecnológica, la creación artística y la protección e incremento del patrimonio cultural del país.&quot; </p><p>El artículo 142° expresa que las instituciones estatales deben cumplir con lo siguiente: a) Educación Laica; b) Calidad y Pertenencia; c) Pluralismo; d) Derechos de los estamentos; e) Equidad; f) Colaboración; y, g) Participación. </p><p>El artículo 143° establece una Red de Instituciones de Educación Superior Estatal, &quot;que tendrá como funciones proponer iniciativas para el desarrollo conjunto y el mejoramiento continuo de la calidad de las instituciones que lo integran. Entre estas iniciativas se incluyen, por ejemplo, orientaciones que vinculen el quehacer de las instituciones estatales con las políticas nacionales y regionales; colaboración e intercambio de buenas prácticas en materias tales como gestión institucional y procesos de evaluación de docentes, académicos y funcionarios; articulación de la oferta académica, de planes de estudios y programas de movilidad estudiantil, docente y académica; y creación de programas y equipos de investigación, ya sea conjuntamente o en colaboración entre ellas, así como la creación y uso de infraestructura común para investigación, creación e innovación.&quot; </p><p>Finalmente, y en relación al financiamiento, el artículo 188° establece la creación de &quot;un fondo, adicional al definido en el artículo anterior, para las instituciones de educación superior estatales, cuyo objeto es el cumplimiento de las normas, principios y responsabilidades que les son propias (…) Este fondo contribuirá al cumplimiento de compromisos acordados entre cada institución estatal y el Estado, que sean necesarios para el desarrollo de país y sus regiones y al fortalecimiento institucional, mediante el financiamiento de acciones asociadas al mejoramiento de la calidad. (…) El monto total de este Fondo, será fijado anualmente en la Ley de Presupuestos del Sector Público.&quot;</p>"}],
[{"data" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu tincidunt quam, at condimentum massa. Phasellus dignissim mauris non massa sodales laoreet. Nunc suscipit orci at felis egestas feugiat. Donec non diam at ex egestas hendrerit suscipit sit amet magna. Mauris at auctor nibh. Aenean cursus nibh malesuada ultricies pharetra. Suspendisse eros orci, tristique sed lacus vitae, lobortis ornare risus. Nam volutpat iaculis quam, at vehicula lorem vestibulum non. Pellentesque maximus nisi quis massa blandit gravida. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Suspendisse ut egestas eros. Praesent volutpat, tortor at interdum condimentum, nisl lacus eleifend velit, ut dignissim sapien nibh ac eros. Sed porttitor rutrum lorem.\nIn hac habitasse platea dictumst. Phasellus id tempus sapien. Nulla a lacinia tellus. In facilisis facilisis ipsum auctor convallis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra lectus diam, quis commodo lacus molestie pharetra. Pellentesque vel urna ultrices, hendrerit nulla vitae, ultricies nulla."}],
[{"data" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu tincidunt quam, at condimentum massa. Phasellus dignissim mauris non massa sodales laoreet. Nunc suscipit orci at felis egestas feugiat. Donec non diam at ex egestas hendrerit suscipit sit amet magna. Mauris at auctor nibh. Aenean cursus nibh malesuada ultricies pharetra. Suspendisse eros orci, tristique sed lacus vitae, lobortis ornare risus. Nam volutpat iaculis quam, at vehicula lorem vestibulum non. Pellentesque maximus nisi quis massa blandit gravida. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Suspendisse ut egestas eros. Praesent volutpat, tortor at interdum condimentum, nisl lacus eleifend velit, ut dignissim sapien nibh ac eros. Sed porttitor rutrum lorem.\nIn hac habitasse platea dictumst. Phasellus id tempus sapien. Nulla a lacinia tellus. In facilisis facilisis ipsum auctor convallis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra lectus diam, quis commodo lacus molestie pharetra. Pellentesque vel urna ultrices, hendrerit nulla vitae, ultricies nulla."}],
[{"data" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu tincidunt quam, at condimentum massa. Phasellus dignissim mauris non massa sodales laoreet. Nunc suscipit orci at felis egestas feugiat. Donec non diam at ex egestas hendrerit suscipit sit amet magna. Mauris at auctor nibh. Aenean cursus nibh malesuada ultricies pharetra. Suspendisse eros orci, tristique sed lacus vitae, lobortis ornare risus. Nam volutpat iaculis quam, at vehicula lorem vestibulum non. Pellentesque maximus nisi quis massa blandit gravida. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Suspendisse ut egestas eros. Praesent volutpat, tortor at interdum condimentum, nisl lacus eleifend velit, ut dignissim sapien nibh ac eros. Sed porttitor rutrum lorem.\nIn hac habitasse platea dictumst. Phasellus id tempus sapien. Nulla a lacinia tellus. In facilisis facilisis ipsum auctor convallis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra lectus diam, quis commodo lacus molestie pharetra. Pellentesque vel urna ultrices, hendrerit nulla vitae, ultricies nulla."}],
[{"data" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu tincidunt quam, at condimentum massa. Phasellus dignissim mauris non massa sodales laoreet. Nunc suscipit orci at felis egestas feugiat. Donec non diam at ex egestas hendrerit suscipit sit amet magna. Mauris at auctor nibh. Aenean cursus nibh malesuada ultricies pharetra. Suspendisse eros orci, tristique sed lacus vitae, lobortis ornare risus. Nam volutpat iaculis quam, at vehicula lorem vestibulum non. Pellentesque maximus nisi quis massa blandit gravida. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Suspendisse ut egestas eros. Praesent volutpat, tortor at interdum condimentum, nisl lacus eleifend velit, ut dignissim sapien nibh ac eros. Sed porttitor rutrum lorem.\nIn hac habitasse platea dictumst. Phasellus id tempus sapien. Nulla a lacinia tellus. In facilisis facilisis ipsum auctor convallis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra lectus diam, quis commodo lacus molestie pharetra. Pellentesque vel urna ultrices, hendrerit nulla vitae, ultricies nulla."}],
[{"data" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu tincidunt quam, at condimentum massa. Phasellus dignissim mauris non massa sodales laoreet. Nunc suscipit orci at felis egestas feugiat. Donec non diam at ex egestas hendrerit suscipit sit amet magna. Mauris at auctor nibh. Aenean cursus nibh malesuada ultricies pharetra. Suspendisse eros orci, tristique sed lacus vitae, lobortis ornare risus. Nam volutpat iaculis quam, at vehicula lorem vestibulum non. Pellentesque maximus nisi quis massa blandit gravida. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Suspendisse ut egestas eros. Praesent volutpat, tortor at interdum condimentum, nisl lacus eleifend velit, ut dignissim sapien nibh ac eros. Sed porttitor rutrum lorem.\nIn hac habitasse platea dictumst. Phasellus id tempus sapien. Nulla a lacinia tellus. In facilisis facilisis ipsum auctor convallis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra lectus diam, quis commodo lacus molestie pharetra. Pellentesque vel urna ultrices, hendrerit nulla vitae, ultricies nulla."}],
[{"data" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu tincidunt quam, at condimentum massa. Phasellus dignissim mauris non massa sodales laoreet. Nunc suscipit orci at felis egestas feugiat. Donec non diam at ex egestas hendrerit suscipit sit amet magna. Mauris at auctor nibh. Aenean cursus nibh malesuada ultricies pharetra. Suspendisse eros orci, tristique sed lacus vitae, lobortis ornare risus. Nam volutpat iaculis quam, at vehicula lorem vestibulum non. Pellentesque maximus nisi quis massa blandit gravida. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Suspendisse ut egestas eros. Praesent volutpat, tortor at interdum condimentum, nisl lacus eleifend velit, ut dignissim sapien nibh ac eros. Sed porttitor rutrum lorem.\nIn hac habitasse platea dictumst. Phasellus id tempus sapien. Nulla a lacinia tellus. In facilisis facilisis ipsum auctor convallis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra lectus diam, quis commodo lacus molestie pharetra. Pellentesque vel urna ultrices, hendrerit nulla vitae, ultricies nulla."}]]
  $scope.organismos =  [
 {"name" : 'Facultad de Arquitectura y Urbanismo'}
 ,{"name" : 'Facultad de Artes'}
 ,{"name" : 'Facultad de Ciencias'}
 ,{"name" : 'Facultad de Ciencias Agronómicas'}
 ,{"name" : 'Facultad de Economía y Negocios'}
 ,{"name" : 'Facultad de Ciencias Físicas y Matemáticas'}
 ,{"name" : 'Facultad de Ciencias Forestales y de la Conservación de la Naturaleza'}
 ,{"name" : 'Facultad de Ciencias Químicas y Farmacéuticas'}
 ,{"name" : 'Facultad de Ciencias Sociales'}
 ,{"name" : 'Facultad de Ciencias Veterinarias y Pecuarias'}
 ,{"name" : 'Facultad de Derecho'}
 ,{"name" : 'Facultad de Filosofía y Humanidades'}
 ,{"name" : 'Facultad de Medicina'}
 ,{"name" : 'Facultad de Odontología'}
 ,{"name" : 'Instituto de Nutrición y Tecnología de los Alimentos'}
 ,{"name" : 'Instituto de Estudios Internacionales'}
 ,{"name" : 'Instituto de Asuntos Públicos'}
 ,{"name" : 'Instituto de la Comunicación e Imagen'}
 ,{"name" : 'Programa Académico de Bachillerato'}
 ,{"name" : 'Hospital Clínico'}
 ,{"name" : 'Rectoría'}
 ,{"name" : 'Prorrectoría'}
 ,{"name" : 'Vicerrectoría de Asuntos Académicos'}
 ,{"name" : 'Vicerrectoría de Asuntos Económicos y Gestión Institucional'}
 ,{"name" : 'Secretaría General'}
 ,{"name" : 'Vicerrectoría de Investigación y Desarrollo'}
 ,{"name" : 'Vicerrectoría de Extensión'}
 ,{"name" : 'Vicerrectoría de Asuntos Estudiantiles y Comunitarios'}
 ,{"name" : 'Centro de Extensión Artística y Cultural "D. S. C."'}
 ,{"name" : 'Liceo Manuel de Salas'}
 ,{"name" : 'Departamento de Evaluación, Medición y Registro Educaciona'}]

 $scope.campus =[{"name":'Campus Andrés Bello'},
{"name":'Campus Beauchef'},
{"name":'Campus Juan Gómez Millas'},
{"name":'Campus Norte'},
{"name":'Campus Sur'},
{"name":'Casa Central'},
{"name": 'Otros'}]
  cargarWatchersGeo();

  $scope.to_trusted = function(html_code) {
    return $sce.trustAsHtml(html_code);
}


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

app.filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };    
}])