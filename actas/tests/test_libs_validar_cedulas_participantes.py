# -*- coding: utf-8 -*-
from django.test import TestCase

from mock import patch, MagicMock

from ..libs import validar_cedulas_participantes
from .base_tests import get_fixture_content


class LibsValidarCedulasParticipantesTestCase(TestCase):

    @patch('actas.libs.requests.get')
    def test_datos_ok(self, mock_requests):
        mock = MagicMock()
        mock.status_code = 200
        mock.content = get_fixture_content(
            'verificacion_cedula_registro_civil_vigente.htm'
        )

        mock_requests.side_effect = lambda *a, **ka: mock

        expected = []
        result = validar_cedulas_participantes({
            'participantes': [
                {'rut': '1-9', 'serie_cedula': 'A'},
            ]
        })
        self.assertEquals(expected, result)
