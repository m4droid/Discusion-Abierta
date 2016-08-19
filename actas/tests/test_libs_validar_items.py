# -*- coding: utf-8 -*-
from django.test.testcases import TransactionTestCase

from ..libs import validar_items


class LibsValidarParticipantesExistentesTestCase(TransactionTestCase):

    fixtures = [
        'regiones.json',
        'provincias.json',
        'comunas.json',
        'test_users.json',
        'test_grupoitems.json',
        'test_items.json',
        'test_actas.json',
    ]

    def test_item_pk_invalido(self):
        expected = ['Existen errores de validación en ítem 2.']
        result = validar_items({
            'itemsGroups': [
                {
                    'items': [
                        {'pk': 2},

                    ]
                },
            ]
        })
        self.assertEquals(expected, result)

    def test_item_categoria_invalida(self):
        expected = ['No se ha seleccionado la categoría del ítem 1.']
        result = validar_items({
            'itemsGroups': [
                {
                    'items': [
                        {'pk': 1, 'nombre': 'C'},
                    ]
                },
            ]
        })
        self.assertEquals(expected, result)

        expected = ['No se ha seleccionado la categoría del ítem 1.']
        result = validar_items({
            'itemsGroups': [
                {
                    'items': [
                        {'pk': 1, 'nombre': 'C', 'categoria': '3'},
                    ]
                },
            ]
        })
        self.assertEquals(expected, result)

    def test_item_categoria_sin_responder(self):
        expected = ['No se han respondido todos los items del acta.']
        result = validar_items({
            'itemsGroups': [
                {
                    'items': []
                },
            ]
        })
        self.assertEquals(expected, result)

    def test_item_categoria_ok(self):
        expected = []
        result = validar_items({
            'itemsGroups': [
                {
                    'items': [
                        {'pk': 1, 'nombre': 'C', 'categoria': '0'},
                    ]
                },
            ]
        })
        self.assertEquals(expected, result)
