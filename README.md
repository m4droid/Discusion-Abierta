# Discusion Abierta

[![Build Status](https://travis-ci.org/m4droid/Discusion-Abierta.svg?branch=master)](https://travis-ci.org/m4droid/Discusion-Abierta)
[![Coverage Status](https://coveralls.io/repos/github/m4droid/Discusion-Abierta/badge.svg?branch=master)](https://coveralls.io/github/m4droid/Discusion-Abierta)

### Instrucciones

##### 0. CREAR VIRTUALENV (CON VIRTUALENVWRAPPER)
	# Nuevo ambiente
	mkvirtualenv discusion

	# Existente
	workon discusion

##### 1. COPIAR ARCHIVO DE CONFIGURACION
	# Linux / OS X
    cp discusion_abierta/settings.py{.default,}

    # Windows
    copy discusion_abierta\settings.py.default discusion_abierta\settings.py

##### 2. INSTALAR DEPENDENCIAS PYTHON
    pip install -r requirements.txt
    pip install -r requirements-test.txt

##### 3. INSTALAR DEPENDENCIAS BOWER
    bower install

##### 4. CARGAR FIXTURES
    python manage.py loaddata regiones provincias comunas

##### 5. EJECUTAR SERVICIO WEB
    python manage.py runserver
