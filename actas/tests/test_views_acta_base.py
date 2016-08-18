# -*- coding: utf-8 -*-
from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from django.test.utils import override_settings


class ViewsSubirConfirmarTestCase(TestCase):

    def setup(self):
        self.client = Client()

    def test_obtener_acta_base_defecto(self):

        expected = {
            u'min_participantes': 4,
            u'max_participantes': 10,
            u'geo': {},
            u'participantes': [{} for _ in range(4)],
            u'itemsGroups': [],  # TODO: Fix this
        }

        response = self.client.get(reverse('actas:base'))
        self.assertEquals(200, response.status_code)
        self.assertEquals(expected, response.json())

    def test_obtener_acta_base_settings_py(self):

        expected = {
            u'min_participantes': 5,
            u'max_participantes': 9,
            u'geo': {},
            u'participantes': [{} for _ in range(5)],
            u'itemsGroups': [],  # TODO: Fix this
        }

        with override_settings(DISCUSION_ABIERTA={'PARTICIPANTES_MIN': expected['min_participantes'], 'PARTICIPANTES_MAX': expected['max_participantes']}):
            response = self.client.get(reverse('actas:base'))
            self.assertEquals(200, response.status_code)
            self.assertEquals(expected, response.json())
