# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test.testcases import TransactionTestCase

from ..models import Region, Provincia, Comuna, GrupoItems, Item


class ModelRegionTestCase(TransactionTestCase):

    fixtures = ['regiones.json']

    def test_model_to_string(self):
        expected = Region.objects.get(pk=13)
        self.assertEquals('13 - Metropolitana de Santiago', str(expected))


class ModelProvinciaTestCase(TransactionTestCase):

    fixtures = ['regiones.json', 'provincias.json']

    def test_model_to_string(self):
        expected = Provincia.objects.get(pk=131)
        self.assertEquals('Metropolitana de Santiago - Santiago', str(expected))


class ModelComunaTestCase(TransactionTestCase):

    fixtures = ['regiones.json', 'provincias.json', 'comunas.json']

    def test_model_to_string(self):
        expected = Comuna.objects.get(pk=13101)
        self.assertEquals(
            'Metropolitana de Santiago - Santiago - Santiago',
            str(expected)
        )


class ModelGrupoItemsTestCase(TransactionTestCase):

    fixtures = ['grupoitems.json']

    def test_model_to_string(self):
        expected = GrupoItems.objects.get(pk=1)
        self.assertEquals(
            'Educación Estatal: Mejoramiento',
            str(expected).decode('utf-8')
        )

    def test_model_to_dict(self):
        expected = {
            u'pk': 1,
            u'nombre': u'Educación Estatal: Mejoramiento',
            u'descripcion': u'¿Cuál de los siguientes ítems considera usted que son necesarios para mejorar la educación estatal actualmente?',
            u'items': [],
        }
        self.assertEquals(
            expected,
            GrupoItems.objects.get(pk=1).to_dict()
        )


class ModelItemTestCase(TransactionTestCase):

    fixtures = ['grupoitems.json', 'items.json']

    def test_model_to_string(self):
        expected = Item.objects.get(pk=1)
        self.assertEquals(
            'Laica',
            str(expected).decode('utf-8')
        )

    def test_model_to_dict(self):
        expected = {
            u'pk': 1,
            u'nombre': u'Laica',
        }
        self.assertEquals(
            expected,
            Item.objects.get(pk=1).to_dict()
        )
