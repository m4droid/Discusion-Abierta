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
[{"data" : "<p>El título VII del proyecto de Ley versa sobre el Financiamiento Público de la Educación Superior. </p><p>El artículo 156° plantea: &quot;Las universidades, institutos profesionales y centros de formación técnica, ya sean estatales o reconocidos oficialmente por el Estado, en este último caso que cumplan con los requisitos señalados en esta ley, recibirán el financiamiento institucional para la gratuidad de conformidad a las condiciones que establece este título.&quot;</p><p>El artículo 157° establece que &quot;para optar a este financiamiento institucional para la gratuidad, las instituciones de educación superior deberán: a) Contar con nivel A, B o C de acreditación; b) Estar constituidas como personas jurídicas de derecho privado sin fines de lucro o cuya personalidad jurídica derive de corporaciones de derecho público u otras entidades de derecho público reconocidas por ley y dar cumplimiento a las disposiciones señaladas en el título V de la presente ley; c) Estar adscritas, al menos un año antes de la solicitud respectiva, al Sistema Común de Acceso (…); y, d) Aplicar políticas, previamente autorizadas por la Subsecretaría de Educación Superior, al menos un año antes de la solicitud respectiva, que permitan el acceso equitativo de estudiantes; y contar con programa de apoyo a estudiantes vulnerables que promuevan su retención, fomentando que al menos el 20% de la matrícula total de la institución corresponda a estudiantes de hogares pertenecientes a los cuatro primeros deciles de menores ingresos del país.&quot;</p><p>En relación a las instituciones estatales, el mismo artículo señala que &quot;accederán a este financiamiento por el solo ministerio de la ley, debiendo dar cumplimiento a las obligaciones señaladas en el presente título, sin perjuicio de lo dispuesto en el artículo 149° [sobre sus estructuras de gobierno].&quot; </p><p>Posteriormente, el artículo 161° expresa que toda institución de educación superior que acceda al financiamiento institucional deberá dar cumplimiento a las siguientes obligaciones: a) Regirse por la regulación de aranceles, derechos básicos de matrícula y cobros por concepto de graduación o titulación establecidos en la ley; b) Regirse por la regulación de vacantes presentada en la ley; y, c) Otorgar estudios gratuitos. </p><p>Luego, el artículo 187°, plantea que &quot;La Ley de Presupuestos del Sector Público considerará recursos para un fondo de desarrollo y mejora de las funciones de investigación y creación artística de aquellas universidades que accedan al financiamiento institucional para la gratuidad de la presente ley. La distribución de dichos recursos se realizará considerando el desempeño de éstas, medido a través de indicadores de investigación, creación artística e innovación.&quot;</p><p>Finalmente, el artículo 188° crea un fondo adicional &quot;para las instituciones de educación superior, cuyo objeto es el cumplimiento de las normas, principios y responsabilidades que les son propias, señaladas en el título VI de esta ley. Este fondo contribuirá al cumplimiento de compromisos acordados entre cada institución estatal y el Estado, que sean necesarios para el desarrollo de país y sus regiones y al fortalecimiento institucional, mediante el financiamiento de acciones asociadas al mejoramiento de la calidad.&quot; Al respecto, el mismo artículo señala que &quot;el monto total de este Fondo, será fijado anualmente en la Ley de Presupuestos del Sector Público.&quot;</p>"}],
[{"data" : "<p>El párrafo 2° del título II del proyecto de ley se refiere al Sistema Común de Acceso a las Instituciones de Educación Superior.</p><p>El artículo 12° establece la creación de &quot;un Sistema Común de Acceso a las Instituciones de Educación Superior, el que establecerá los procesos e instrumentos para la postulación, admisión y selección de estudiantes a las instituciones de educación superior, respecto de carreras o programas de estudio conducentes a títulos técnicos o profesionales o grados académicos, excluyendo postgrados o pos títulos. Este Sistema de Acceso deberá considerar la diversidad de talentos, capacidades o trayectorias previas de las y los estudiantes estableciendo instrumentos diferenciados según tipo de institución o carrera, sea ésta del subsistema universitario o técnico profesional. </p><p>Los instrumentos señalados en el inciso anterior serán de aplicación general, pudiendo incorporarse otros desarrollados por las instituciones de educación superior, los cuales deberán ser, en todo caso, autorizados por la Subsecretaría. </p><p>El Sistema de Acceso podrá contemplar programas especiales que tengan por objeto promover la equidad en el ingreso de estudiantes, de carácter general, sin perjuicio de ello, las instituciones podrán definir sus propios programas, los que deberán ser aprobados por la Subsecretaría. </p><p>El Sistema de Acceso será obligatorio para las universidades, institutos profesionales y centros de formación técnica que reciban recursos públicos a través del Ministerio de Educación, de conformidad a lo dispuesto en el presente párrafo. Sin perjuicio de lo anterior, las demás instituciones podrán adscribir al Sistema de Acceso.&quot;</p><p>El artículo 14° del proyecto de ley plantea: &quot;El proceso de admisión deberá desarrollarse sobre la base de las preferencias que las y los estudiantes definan en su postulación, del mérito expresado en los resultados que obtengan en los instrumentos de medición, y de la evaluación y ponderación correspondientes. </p><p>Para la selección de postulantes, las instituciones podrán definir, para cada carrera o programa de estudio, las ponderaciones que se aplicarán a los resultados de las y los estudiantes en los instrumentos señalados en este artículo, cumpliendo con los correspondientes ponderadores mínimos que establezca el Sistema de Acceso.&quot;</p>"}],
[{"data" : "<p>El artículo 3°, literal f, establece que &quot;Las instituciones de educación superior deben promover y respetar la participación responsable de todos los estamentos en su quehacer institucional, con el propósito de fomentar la convivencia democrática al interior de aquellas y el ejercicio de una ciudadanía crítica, responsable y solidaria.&quot;</p><p>En el texto no existen referencias específicas a las formas de gobierno de las instituciones privadas. En relación a las instituciones estatales, en el Título VI, el artículo 142°, letra g), establece específicamente que &quot;establecerán formas de gobierno interno que promuevan la diversidad de opiniones y visiones de los miembros que componen sus comunidades, que protejan la libertad de expresión y de cátedra, y garanticen la participación de sus estamentos en los órganos colegiados.&quot;</p><p>El artículo 150° define al Rector como la máxima autoridad unipersonal ejecutiva y representante legal de la institución. Sólo podrá ser reelecto una vez en forma consecutiva. Asimismo, el artículo 151° plantea que: &quot;El Consejo Directivo será la máxima autoridad colegiada resolutiva, cuya función principal será velar por los intereses y por el cumplimiento de los fines de la universidad, preservar su patrimonio y vincular su quehacer con las políticas nacionales y regionales, así como promover que la universidad contribuya al desarrollo del país.&quot; Según el artículo 153°, el Consejo Directivo estará compuesto por: &quot;nueve miembros, con derecho a voz y voto, que se designarán de la siguiente manera: a) Cuatro representantes del Presidente o Presidenta de la República, quienes serán profesionales de reconocida experiencia en actividades académicas o directivas. b) Dos representantes de los académicos y académicas, electos de conformidad a la forma en que se elige el Rector o Rectora. c) Dos representantes del órgano colegiado a que hace referencia el artículo 154° de esta ley. d) El Rector o Rectora, quien lo presidirá.&quot;</p><p>El artículo 154° expresa que: &quot;Los estatutos de las universidades estatales deberán considerar al menos un órgano colegiado de carácter normativo, distinto del Consejo Directivo, cuya principal función será la regulación de las materias relativas al desarrollo de las funciones propias de la universidad, en particular aquellas académicas, así como también elaborar y proponer al Rector o Rectora el plan de desarrollo institucional. Dicho órgano deberá contemplar la participación con derecho a voz y voto de todos los estamentos de la universidad, asegurando la representación de los miembros del estamento académico en dos tercios. La elección de los representantes de los estamentos que participarán en los órganos colegiados de las universidades, se deberá realizar a través de elección especialmente convocada para dicho efecto y para su validez deberá contar con un quorum de participación de al menos el 40% de los miembros del estamento correspondiente.&quot;</p>"}],
[{"data" : "<p>El artículo 142° en su letra d) establece los derechos de los estamentos en las instituciones estatales: &quot;El acceso, permanencia, promoción y egreso, de todos los miembros de los estamentos de las instituciones estatales se realizará en virtud de sus méritos, capacidades, talentos y aptitudes, mediante procesos transparentes, así como también en consideración a las exigencias académicas de cada institución, en igualdad de oportunidades y sin discriminaciones arbitrarias.&quot;</p><p>Añade además que &quot;las instituciones estatales deberán contar con una carrera docente o académica según corresponda al tipo de institución, objetiva, transparente y pública, basada exclusivamente en el mérito y que establezca los niveles jerárquicos y las correspondientes exigencias para el ingreso, promoción y salida.&quot;</p><p>Por su parte, el artículo 145° plantea que &quot;los cometidos funcionarios y comisiones de servicio de sus funcionarios y funcionarias se regirán según los estatutos y normativa interna de cada institución.&quot;</p><p>A su vez, el artículo 147° expresa que &quot;sin perjuicio de lo establecido en el artículo 9º del decreto con fuerza de ley Nº 1, de 2000, del Ministerio Secretaría General de la Presidencia, las instituciones de educación superior estatales no estarán sujetas a las disposiciones de la ley Nº 19.886 de Bases sobre Contratos Administrativos de Suministro y Prestación de Servicios, no obstante que puedan, cuando lo estimen conveniente, hacer uso de ella.&quot;</p><p>No se establecen condiciones para las instituciones privadas.</p>"}],
[{"data" : "<p>En relación a los principios que deben guiar el sistema de educación superior, el artículo 3° en su letra b) versa sobre la calidad: &quot;El Sistema debe orientarse a la búsqueda de la excelencia, al asegurar la calidad de los procesos y resultados en el cumplimiento de sus funciones y fomentando el desarrollo de trayectorias formativas, a lo largo de la vida de las personas. En la búsqueda de la excelencia, la educación superior debe estar motivada por lograr una mejor transmisión del conocimiento a las y los estudiantes y la promoción de su creatividad, de una actitud crítica, orientada a la superación de los límites del conocimiento, a la constante innovación para alcanzar el bienestar, y al respeto por el medio ambiente.&quot;</p><p>Luego, el título III del proyecto de Ley versa sobre el Sistema Nacional de Aseguramiento de la Calidad de la Educación Superior. El artículo 22° establece el Sistema de Aseguramiento de la Calidad de la Educación Superior, al cual le corresponde: &quot;a) El desarrollo de políticas que promuevan la calidad, pertinencia, articulación, inclusión y equidad en el desarrollo de las funciones de las instituciones de educación superior; b) La identificación, recolección y difusión de los antecedentes necesarios para la gestión del Sistema, y la información pública; c) El licenciamiento de instituciones nuevas de educación superior (…); d) La acreditación institucional de las instituciones de educación superior autónomas (…), y la obligatoria de carreras o programas de pregrado y postgrado (…); e) La fiscalización del cumplimiento, por parte de las instituciones de educación superior, de las normas aplicables a la educación superior, y de la legalidad del uso de sus recursos, así como la supervisión de su viabilidad administrativa y financiera, y del cumplimiento de los compromisos académicos con sus estudiantes.&quot;</p><p>El artículo 24° crea el Consejo para la Calidad de la Educación Superior, y el artículo 25° define que su objeto será &quot;evaluar, acreditar y promover la calidad de las instituciones de educación superior autónomas, tanto en el subsistema universitario como en el técnico profesional, y de las carreras o programas de estudio que éstas imparten. Asimismo, le corresponderá desarrollar los procesos de acreditación institucional y los de acreditación de carreras y programas de estudio de pre y postgrado, de conformidad con lo establecido en esta ley.&quot;</p><p>El artículo 42° plantea &quot;La acreditación institucional será obligatoria para las instituciones de educación superior autónomas y consistirá en la evaluación y verificación del cumplimiento de estándares de calidad, los que referirán a recursos, procesos y resultados; así como también, el análisis de mecanismos internos para el aseguramiento de la calidad, considerando tanto su existencia como su aplicación y resultados, y su concordancia con la misión y propósito de las instituciones de educación superior.&quot;</p><p>El artículo 54° define tres niveles de acreditación institucional:<br>- Nivel C: &quot;La institución de educación superior desarrolla sus funciones con calidad, es capaz de mantener dicho desempeño en el tiempo respecto de las funciones que actualmente desarrolla y constituye un aporte a la sociedad. En particular, ésta cuenta con una misión conocida, y con una organización interna y recursos adecuados para llevarla a cabo. Las carreras y programas que ésta imparte entregan el conocimiento y herramientas necesarias para el cumplimiento de los perfiles de egreso, y para el adecuado desempeño de sus egresados en el medio laboral, con pertinencia nacional y regional según corresponda. Asimismo, la institución contribuye a nivel local y regional con la generación de conocimiento, creación, innovación y vinculación con el medio, según corresponda, reconociendo las características del subsistema técnico profesional.&quot;<br>- Nivel B: &quot;La institución de educación superior cumple con lo establecido en el nivel C. Adicionalmente, cuentan con mecanismos de aseguramiento interno de la calidad y recursos que le permiten garantizar que las políticas de desarrollo estratégico, que la institución implemente en las áreas y programas que actualmente imparte, mantienen o mejoran la calidad institucional, y son un aporte a la sociedad. Asimismo, la institución contribuye a nivel regional o nacional con la generación de conocimiento, creación, innovación y vinculación con el medio, según corresponda, reconociendo las características del subsistema técnico profesional.&quot;<br>- Nivel A: &quot;La institución de educación superior cumple con lo establecido en el nivel B. Adicionalmente, cuenta con sistemas de toma de decisión para su crecimiento, políticas de mejoramiento, mecanismos de aseguramiento interno de la calidad, y recursos que le permiten garantizar que las políticas de desarrollo estratégico que ésta implemente mantienen o mejoran la calidad institucional y son un aporte a la sociedad. Asimismo, la institución contribuye a nivel nacional o internacional, con la generación de conocimiento, creación, innovación y vinculación con el medio, según corresponda, reconociendo las características del subsistema técnico profesional.&quot;</p><p>Respecto de la duración de la acreditación, el artículo 55° señala que tendrá una vigencia de ocho años para todos los niveles. El artículo 56° establece que &quot;en caso de que una institución de educación superior logre cumplir con al menos tres cuatros de los estándares de calidad asociados al nivel C de acreditación institucional, y que a partir de los antecedentes examinados sea factible concluir que ésta pueda subsanar los incumplimientos de dichos estándares dentro de tres años, el Directorio [del Sistema de Aseguramiento de la Calidad], mediante resolución fundada, podrá otorgar una acreditación institucional condicional por dicho plazo.&quot; </p><p>Finalmente, el artículo 63° establece &quot;las universidades acreditadas deberán acreditar obligatoriamente las carreras y programas de estudio conducentes a los títulos profesionales de Médico Cirujano, Profesor de Educación Básica, Profesor de Educación Media, Profesor de Educación Técnico Profesional, Profesor de Educación Diferencial o Especial y Educador de Párvulos y los programas de doctorado que impartan.&quot; No se establece ninguna indicación sobre los demás programas de pregrado o postgrado.</p>"}],
[{"data" : "<p>El artículo 78° del proyecto de Ley crea la Superintendencia de Educación Superior, que según el artículo 79° tiene como objeto &quot;fiscalizar y supervigilar el cumplimiento de las disposiciones legales y reglamentarias que regulan la educación superior, así como las instrucciones y normas que ésta dicte en el ámbito de su competencia. Asimismo, le corresponderá fiscalizar la legalidad del uso de los recursos por parte de las instituciones de educación superior y supervisar su viabilidad financiera.&quot;</p><p>El artículo 124° establece que &quot;Las instituciones de educación superior organizadas como personas jurídicas de derecho privado sin fines de lucro sólo podrán tener como controladores, miembros o asociados a personas naturales, personas jurídicas de derecho privado sin fines de lucro, corporaciones de derecho público o que deriven su personalidad jurídica de éstas, u otras entidades de derecho público reconocidas por ley.&quot;</p><p>Posteriormente el artículo 126° expresa que &quot;Las instituciones de educación superior organizadas como personas jurídicas de derecho privado sin fines de lucro tienen la obligación de destinar sus recursos y de reinvertir los excedentes o ganancias que generen, según sea el caso, en la consecución de sus fines y en la mejora de la calidad de la educación que brindan.</p><p>Los actos, convenciones u operaciones realizadas en contravención a lo establecido en el inciso anterior constituirán infracciones gravísimas, sin perjuicio de lo dispuesto en la letra g) del artículo 13° de la ley Nº 20.800, los artículos 132° a 140° de la presente ley y de la responsabilidad penal, civil o administrativa que corresponda.</p><p>El que, administrando a cualquier título los recursos o excedentes de la institución de educación superior, los sustraiga o destine a una finalidad diferente a lo señalado en el inciso primero de este artículo, estará obligado a reintegrarlos a la institución, debidamente reajustados conforme a la variación expresada por el Índice de Precios al Consumidor, en el período comprendido entre el mes anterior a aquel en que se hizo la sustracción o desvío y el mes anterior en que se produjere la restitución. Comprobada la infracción, ésta será sancionada por la Superintendencia, conforme a las normas del título IV de la presente ley, con una multa del 50% de la suma sustraída o desviada. Dichos montos en ningún caso podrán ser descontados ni pagados con cargo a cualquiera de los recursos públicos u otros que perciba la institución.&quot;</p><p>Asimismo, los artículos 127° y 128° definen para todas estas instituciones la creación de un órgano de administración superior, cuya función es &quot;el control superior de la administración financiera y patrimonial de la institución, en concordancia con su plan de desarrollo institucional.&quot;</p><p>Por otro lado, el artículo 144° establece: &quot;Las instituciones de educación superior del Estado serán fiscalizadas por la Contraloría General de la República, de acuerdo con su Ley Orgánica Constitucional. Con todo, quedarán exentas del trámite de toma de razón las materias que a continuación se señalan: a) Contrataciones, modificaciones y terminaciones de contratos del personal académico y no académico a honorarios. b) Bases de licitación, adjudicaciones y contratos de bienes muebles por montos inferiores a 10.000 unidades tributarias mensuales.&quot;</p><p>En otro ámbito, en cuanto a la transparencia del sistema, el artículo 16° plantea que corresponde &quot;a la Subsecretaría administrar un Sistema Nacional de Información de la Educación Superior (en adelante en este título &quot;el Sistema de Información&quot;) que permita a la Subsecretaría y demás órganos del Sistema Nacional de Aseguramiento de la Calidad de la Educación Superior ejercer adecuadamente las funciones y atribuciones que les encomienda la ley, según corresponda, tales como la asignación de recursos públicos, y la administración de los instrumentos de financiamiento público, entre otras.</p><p>Asimismo, el Sistema de Información contendrá los antecedentes necesarios para la adecuada aplicación de las políticas públicas destinadas al sector de educación superior, para la gestión institucional y para la información pública, de manera de lograr una amplia y completa transparencia académica, administrativa y contable de las instituciones de educación superior.&quot;</p><p>El artículo 17° detalla el tipo de información con que contará este sistema de información: &quot;El Sistema Nacional de Información contendrá, entre otra, información del Sistema de Educación Superior relativa a estudiantes, matrícula, docentes, académicos, recursos, infraestructura y resultados del proceso académico; a la naturaleza jurídica de las instituciones de educación superior, a sus socios y quienes ejerzan funciones directivas de acuerdo a lo establecido en el artículo 133°; a su situación patrimonial y financiera; el balance anual debidamente auditado, e información sobre las operaciones realizadas con personas relacionadas a la institución.&quot;</p>"}]]
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