# -*- coding: utf-8 -*-
from django.test import TestCase
from mock import patch, MagicMock

from ..libs import verificar_rut, verificar_cedula
from .base_tests import get_fixture_content


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
            'Número de serie inválido para el RUT 1-9',
        ]

        for params in [('1-9', None), ('1-9', '')]:
            result = verificar_cedula(*params)
            self.assertEquals(expected, result)

    def test_rut_invalido(self):
        expected = [
            'RUT inválido (1-8)',
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

        expected = ['El documento de identidad no está vigente para el RUT 1-9']

        result = verificar_cedula('1-9', 'A')

        self.assertEquals(expected, result)

    @patch('actas.libs.requests.get')
    def test_validacion_regcivil_no_disponible(self, mock_requests):
        mock = MagicMock()
        mock.status_code = 404

        mock_requests.side_effect = lambda *a, **ka: mock

        expected = ['Validación de cédula no disponible.']

        result = verificar_cedula('1-9', 'A')

        self.assertEquals(expected, result)

    @patch('actas.libs.requests.get')
    def test_validacion_regcivil_ok(self, mock_requests):
        mock = MagicMock()
        mock.status_code = 200
        mock.content = get_fixture_content(
            'verificacion_cedula_registro_civil_vigente.htm'
        )

        mock_requests.side_effect = lambda *a, **ka: mock

        result = verificar_cedula('1-9', 'A')

        self.assertEquals([], result)

    @patch('actas.libs.requests.get')
    def test_validacion_regcivil_sin_coincidencias(self, mock_requests):
        mock = MagicMock()
        mock.status_code = 200
        mock.content = get_fixture_content(
            'verificacion_cedula_registro_civil_vigente.htm'
        ).replace(
            'name="form:run" value="1-9"',
            'name="form:run" value="1-8"'
        ).replace(
            'name="form:docNumber" value="A"',
            'name="form:docNumber" value="B"'
        )

        mock_requests.side_effect = lambda *a, **ka: mock

        expected = [
            'RUT no coincide para el RUT 1-9',
            'Número de serie no coincide para el rut 1-9'
        ]

        result = verificar_cedula('1-9', 'A')

        self.assertEquals(expected, result)
