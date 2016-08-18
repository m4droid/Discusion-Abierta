# -*- coding: utf-8 -*-
from django.test import TestCase
from django.test.utils import override_settings

from ..libs import validar_participantes


class LibsValidarParticipantesTestCase(TestCase):

    def test_datos_invalidos(self):
        result = validar_participantes({})
        self.assertEquals(['Error en el formato de los participantes.'], result)

        result = validar_participantes({'participantes': {}})
        self.assertEquals(['Error en el formato de los participantes.'], result)

        result = validar_participantes({'participantes': range(3)})
        self.assertEquals(['Error en el formato de los participantes.'], result)

        result = validar_participantes({'participantes': range(11)})
        self.assertEquals(['Error en el formato de los participantes.'], result)

    @override_settings(DISCUSION_ABIERTA={'PARTICIPANTES_MIN': 1, 'PARTICIPANTES_MAX': 1})
    def test_participante_invalido(self):
        expected = ['Datos del participante 1 inválidos.']
        result = validar_participantes({'participantes': [1]})
        self.assertEquals(expected, result)

        expected = ['RUT del participante 1 es inválido.']
        result = validar_participantes({
            'participantes': [
                {'rut': '1-8'}
            ]
        })
        self.assertEquals(expected, result)

        # Nombre invalidos
        participantes = [
            {'rut': '1-9', 'nombre': 'A', 'apellido': 'EE'},
        ]

        expected = ['Nombre del participante 1 es inválido.']
        result = validar_participantes({
            'participantes': participantes
        })
        self.assertEquals(expected, result)

        # Apellido invalidos
        participantes = [
            {'rut': '1-9', 'nombre': 'AA', 'apellido': 'E'},
        ]

        expected = ['Apellido del participante 1 es inválido.']
        result = validar_participantes({
            'participantes': participantes
        })
        self.assertEquals(expected, result)
