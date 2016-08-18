# -*- coding: utf-8 -*-
from django.test.testcases import TransactionTestCase

from ..libs import validar_datos_geograficos


class LibsValidarDatosGeograficosTestCase(TransactionTestCase):

    fixtures = ['regiones.json', 'provincias.json', 'comunas.json']

    def test_datos_vacios(self):
        result = validar_datos_geograficos({})
        self.assertEquals(['Región inválida.'], result)

        result = validar_datos_geograficos({'geo': {'region': 13}})
        self.assertEquals(['Provincia inválida.'], result)

        result = validar_datos_geograficos({'geo': {'region': 13, 'provincia': 131}})
        self.assertEquals(['Comuna inválida.'], result)

    def test_comuna_invalida(self):
        result = validar_datos_geograficos({'geo': {'region': 13, 'provincia': 131, 'comuna': 13199}})
        self.assertEquals(['Comuna inválida.'], result)

    def test_provincia_invalida(self):
        result = validar_datos_geograficos({'geo': {'region': 13, 'provincia': 132, 'comuna': 13101}})
        self.assertEquals(['Provincia no corresponde a la comuna.'], result)

    def test_region_invalida(self):
        result = validar_datos_geograficos({'geo': {'region': 99, 'provincia': 131, 'comuna': 13101}})
        self.assertEquals(['Región no corresponde a la provincia.'], result)
