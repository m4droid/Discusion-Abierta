# -*- coding: utf-8 -*-
import json
from itertools import cycle
import re

from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from pyquery import PyQuery as pq
import requests

from .models import Comuna, Acta, Item, ActaRespuestaItem


REGEX_RUT = re.compile(r'([0-9]+)\-([0-9K])', re.IGNORECASE)
RUT_VERIFICACION_URL = 'https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml?RUN={0:s}&type=CEDULA&serial={1:s}'


# https://gist.github.com/rbonvall/464824
def _digito_verificador(rut):
    reversed_digits = map(int, reversed(str(rut)))
    factors = cycle(range(2, 8))
    s = sum(d * f for d, f in zip(reversed_digits, factors))
    return (-s) % 11


def verificar_rut(rut_con_dv):
    if type(rut_con_dv) not in [str, unicode] \
            or len(rut_con_dv) == 0 \
            or REGEX_RUT.match(rut_con_dv) is None:
        return False

    rut_con_dv = rut_con_dv.upper()

    rut = rut_con_dv[:-2]
    dv = rut_con_dv[-1]

    if dv == 'K':
        dv = 10
    dv = int(dv)

    digito = _digito_verificador(rut)

    return digito == dv


def _get_html_verificar_cedula(rut_con_dv, serie):
    r = requests.get(
        RUT_VERIFICACION_URL.format(rut_con_dv, serie),
        verify=False  # Registro Civil pls
    )

    if r.status_code != 200:
        return None

    return r.content


def verificar_cedula(rut_con_dv, serie):
    result = []

    if type(rut_con_dv) not in [str, unicode] \
            or len(rut_con_dv) == 0 \
            or not verificar_rut(rut_con_dv):
        result.append('RUT inválido ({0})'.format(rut_con_dv) if rut_con_dv is not None and len(rut_con_dv) > 0 else 'RUT inválido')

    if type(serie) not in [str, unicode] or len(serie) == 0:
        result.append('Número de serie inválido para el RUT {0:s}'.format(rut_con_dv) if rut_con_dv is not None and len(rut_con_dv) > 0 else 'Número de serie inválido')

    if len(result) > 0:
        return result

    serie = serie.upper()

    html = _get_html_verificar_cedula(rut_con_dv, serie)

    if html is None:
        result.append('Validación de cédula no disponible.')
        return result

    html = html.replace(
        '<html xmlns="http://www.w3.org/1999/xhtml">',
        '<html>'
    )

    document = pq(html)

    verificacion_rut = document('form input#form\:run').val()
    verificacion_serie = document('form input#form\:docNumber').val()
    vigente = document('table#tableResult td.setWidthOfSecondColumn').text().upper() == 'VIGENTE'

    if rut_con_dv != verificacion_rut:
        result.append('RUT no coincide para el RUT {0:s}'.format(rut_con_dv))

    if serie != verificacion_serie:
        result.append('Número de serie no coincide para el rut {0:s}'.format(rut_con_dv))

    if not vigente:
        result.append('El documento de identidad no está vigente para el RUT {0:s}'.format(rut_con_dv))

    return result


def validar_datos_geograficos(acta):
    errores = []

    comuna_seleccionada = acta.get('geo', {}).get('comuna')
    provincia_seleccionada = acta.get('geo', {}).get('provincia')
    region_seleccionada = acta.get('geo', {}).get('region')

    if type(region_seleccionada) != int:
        return ['Región inválida.']

    if type(provincia_seleccionada) != int:
        return ['Provincia inválida.']

    if type(comuna_seleccionada) != int:
        return ['Comuna inválida.']

    comunas = Comuna.objects.filter(pk=comuna_seleccionada)

    if len(comunas) != 1:
        errores.append('Comuna inválida.')
    else:
        if comunas[0].provincia.pk != provincia_seleccionada:
            errores.append('Provincia no corresponde a la comuna.')

        if comunas[0].provincia.region.pk != region_seleccionada:
            errores.append('Región no corresponde a la provincia.')

    return errores


def validar_participantes(acta):
    errores = []

    participantes = acta.get('participantes', [])

    config = obtener_config()

    if type(participantes) != list \
            or not (config['participantes_min'] <= len(participantes) <= config['participantes_max']):
        errores.append('Error en el formato de los participantes.')
        return errores

    for i, participante in enumerate(participantes):
        errores += _validar_participante(participante, i + 1)

    if len(errores) > 0:
        return errores

    ruts_participantes = [p['rut'] for p in participantes]

    # Ruts diferentes
    ruts = set(ruts_participantes)
    if not (config['participantes_min'] <= len(ruts) <= config['participantes_max']):
        return ['Existen RUTs repetidos']

    # Nombres diferentes
    nombres = set(
        (p['nombre'].lower(), p['apellido'].lower(), ) for p in participantes
    )
    if not (config['participantes_min'] <= len(nombres) <= config['participantes_max']):
        return ['Existen nombres repetidos']

    # Verificar que los participantes no hayan enviado una acta antes
    participantes_en_db = User.objects.filter(username__in=list(ruts))

    if len(participantes_en_db) > 0:
        for participante in participantes_en_db:
            errores.append('El RUT {0:s} ya participó del proceso.'.format(participante.username))

    return errores


def _validar_participante(participante, pos):
    errores = []

    if type(participante) != dict:
        errores.append('Datos del participante {0:d} inválidos.'.format(pos))
        return errores

    if not verificar_rut(participante.get('rut')):
        errores.append('RUT del participante {0:d} es inválido.'.format(pos))
        return errores

    nombre = participante.get('nombre')
    apellido = participante.get('apellido')

    if type(nombre) not in [str, unicode] or len(nombre) < 2:
        errores.append('Nombre del participante {0:d} es inválido.'.format(pos))

    if type(apellido) not in [str, unicode] or len(apellido) < 2:
        errores.append('Apellido del participante {0:d} es inválido.'.format(pos))

    return errores


def validar_cedulas_participantes(acta):
    errores = []

    participantes = acta.get('participantes', [])

    for participante in participantes:
        errores += verificar_cedula(participante.get('rut'), participante.get('serie_cedula'))

    return errores


def validar_items(acta):
    errores = []

    # TODO: Validar todos los items por DB

    for group in acta['itemsGroups']:
        for i, item in enumerate(group['items']):
            acta_item = Item.objects.filter(pk=item.get('pk'))

            if len(acta_item) != 1 or acta_item[0].nombre != item.get('nombre'):
                errores.append(
                    'Existen errores de validación en ítem {0:s} del grupo {1:s}.'.format(
                        item.get('nombre').encode('utf-8'),
                        group.get('nombre').encode('utf-8')
                    )
                )

            if item.get('categoria') not in ['-1', '0', '1']:
                errores.append(
                    'No se ha seleccionado la categoría del ítem {0:s}, del grupo {1:s}.'.format(
                        item.get('nombre').encode('utf-8'),
                        group.get('nombre').encode('utf-8')
                    )
                )

    return errores


def guardar_acta(datos_acta):
    acta = Acta(
        comuna=Comuna.objects.get(pk=datos_acta['geo']['comuna']),
        memoria_historica=datos_acta.get('memoria'),
        fecha=timezone.now(),
    )

    acta.save()

    for p in datos_acta['participantes']:
        acta.participantes.add(_crear_usuario(p))

    acta.save()

    for group in datos_acta['itemsGroups']:
        for i in group['items']:
            item = Item.objects.get(pk=i['pk'])
            acta_item = ActaRespuestaItem(
                acta=acta,
                item=item,
                categoria=i['categoria'],
                fundamento=i.get('fundamento')
            )
            acta_item.save()


def validar_acta_json(request):
    if request.method != 'POST':
        return (None, 'Request inválido.',)

    acta = request.body.decode('utf-8')

    try:
        acta = json.loads(acta)
    except ValueError:
        return (None, 'Acta inválida.',)

    for func_val in [validar_datos_geograficos, validar_participantes, validar_items]:
        errores = func_val(acta)
        if len(errores) > 0:
            return (acta, errores,)

    return (acta, [],)


def obtener_config():
    config = {
        'participantes_min': 4,
        'participantes_max': 10,
    }

    if hasattr(settings, 'DISCUSION_ABIERTA') and type(settings.DISCUSION_ABIERTA) == dict:
        config['participantes_min'] = int(
            settings.DISCUSION_ABIERTA.get('PARTICIPANTES_MIN', config['participantes_min'])
        )
        config['participantes_max'] = int(
            settings.DISCUSION_ABIERTA.get('PARTICIPANTES_MAX', config['participantes_max'])
        )

    return config


def _crear_usuario(datos_usuario):
    usuario = User(username=datos_usuario['rut'])
    usuario.first_name = datos_usuario['nombre']
    usuario.last_name = datos_usuario['apellido']
    usuario.save()
    return usuario
