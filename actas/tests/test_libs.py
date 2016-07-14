# -*- coding: utf-8 -*-
# from __future__ import unicode_literals

import os

from django.test import TestCase
from mock import patch

from ..libs import verificar_rut, verificar_cedula


def get_fixture_content(fixture_path):
    abs_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        'fixtures',
        fixture_path
    )

    with open(abs_path) as file_:
        content = file_.read()

    return content


class LibsVerificarRutTestCase(TestCase):

    def test_parametros_vacios(self):
        for params in [(None, ), ('', )]:
            self.assertEquals(False, verificar_rut(*params))

    def test_rut_mal_formateado(self):
        for params in [('19', ), ('1-', ), ('-9', )]:
            self.assertEquals(False, verificar_rut(*params))

    def test_rut_invalido(self):
        self.assertEquals(False, verificar_rut('1-8'))

    def test_rut_ok(self):
        self.assertEquals(True, verificar_rut('1-9'))
        self.assertEquals(True, verificar_rut('6-k'))


class LibsValidarCedulaTestCase(TestCase):

    def test_parametros_vacios(self):
        expected = [
            'RUT inválido',
            'Número de serie inválido',
        ]

        result = verificar_cedula(None, None)
        self.assertEquals(expected, result)

    def test_rut_vacio(self):
        expected = [
            'RUT inválido',
        ]

        for params in [(None, 'A'), ('', 'A')]:
            result = verificar_cedula(*params)
            self.assertEquals(expected, result)

    def test_serie_vacio(self):
        expected = [
            'Número de serie inválido',
        ]

        for params in [('1-9', None), ('1-9', '')]:
            result = verificar_cedula(*params)
            self.assertEquals(expected, result)

    def test_rut_invalido(self):
        expected = [
            'RUT inválido',
        ]

        result = verificar_cedula('1-8', 'A')
        self.assertEquals(expected, result)

    @patch('actas.libs._get_html_verificar_cedula')
    def test_parametros_ok(self, mock_http_get):
        mock_http_get.side_effect = lambda r, s: get_fixture_content(
            'verificacion_cedula_registro_civil_vigente.htm'
        )

        result = verificar_cedula('1-9', 'A')

        self.assertEquals([], result)

    @patch('actas.libs._get_html_verificar_cedula')
    def test_parametros_cedula_no_vigente(self, mock_http_get):
        mock_http_get.side_effect = lambda r, s: get_fixture_content(
            'verificacion_cedula_registro_civil_no_vigente.htm'
        )

        expected = ['El documento de identidad no está vigente']

        result = verificar_cedula('1-9', 'A')

        self.assertEquals(expected, result)
