# -*- coding: utf-8 -*-
from django.test import TestCase
from django.test.testcases import TransactionTestCase
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

    @override_settings(DISCUSION_ABIERTA={'PARTICIPANTES_MIN': 2, 'PARTICIPANTES_MAX': 2})
    def test_participantes_ruts_repetidos(self):
        expected = ['Existen RUTs repetidos.']
        result = validar_participantes({
            'participantes': [
                {'rut': '1-9', 'nombre': 'Aa', 'apellido': 'Bb'},
                {'rut': '1-9', 'nombre': 'Aa', 'apellido': 'Bb'},
            ]
        })
        self.assertEquals(expected, result)

    @override_settings(DISCUSION_ABIERTA={'PARTICIPANTES_MIN': 2, 'PARTICIPANTES_MAX': 2})
    def test_participantes_nombres_repetidos(self):
        expected = ['Existen nombres repetidos.']
        result = validar_participantes({
            'participantes': [
                {'rut': '1-9', 'nombre': 'Aa', 'apellido': 'Bb'},
                {'rut': '2-7', 'nombre': 'Aa', 'apellido': 'Bb'},
            ]
        })
        self.assertEquals(expected, result)


class LibsValidarParticipantesExistentesTestCase(TransactionTestCase):

    fixtures = [
        'regiones.json',
        'provincias.json',
        'comunas.json',
        'test_users.json',
        'test_grupoitems.json',
        'test_items.json',
        'test_actas.json',
        'test_actasrespuestasitems.json',
    ]

    @override_settings(DISCUSION_ABIERTA={'PARTICIPANTES_MIN': 1, 'PARTICIPANTES_MAX': 1})
    def test_participante_existente(self):
        expected = ['El RUT 1-9 ya participó del proceso.']
        result = validar_participantes({
            'participantes': [
                {'rut': '1-9', 'nombre': 'Aa', 'apellido': 'Bb'},
            ]
        })
        self.assertEquals(expected, result)

    @override_settings(DISCUSION_ABIERTA={'PARTICIPANTES_MIN': 1, 'PARTICIPANTES_MAX': 1})
    def test_participante_nuevo(self):
        expected = []
        result = validar_participantes({
            'participantes': [
                {'rut': '2-7', 'nombre': 'Aa', 'apellido': 'Bb'},
            ]
        })
        self.assertEquals(expected, result)
