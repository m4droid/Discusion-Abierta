# -*- coding: utf-8 -*-
# from __future__ import unicode_literals

from itertools import cycle
import re

from pyquery import PyQuery as pq
import requests


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
        result.append('RUT inválido')

    if type(serie) not in [str, unicode] or len(serie) == 0:
        result.append('Número de serie inválido')

    if len(result) > 0:
        return result

    serie = serie.upper()

    html = _get_html_verificar_cedula(rut_con_dv, serie).replace(
        '<html xmlns="http://www.w3.org/1999/xhtml">',
        '<html>'
    )

    document = pq(html)

    verificacion_rut = document('form input#form\:run').val()
    verificacion_serie = document('form input#form\:docNumber').val()
    vigente = document('table#tableResult td.setWidthOfSecondColumn').text().upper() == 'VIGENTE'

    if rut_con_dv != verificacion_rut:
        result.append('RUT no coincide')

    if serie != verificacion_serie:
        result.append('Número de serie no coincide')

    if not vigente:
        result.append('El documento de identidad no está vigente')

    return result
