# -*- coding: utf-8 -*-
from django.test import TestCase, Client
from django.core.urlresolvers import reverse

from ..apps import ActasConfig


class ViewsSubirConfirmarTestCase(TestCase):

    def setup(self):
        self.client = Client()

    def test_obtener_acta_base(self):
        expected = {
            u'min_participantes': ActasConfig.participantes_min,
            u'max_participantes': ActasConfig.participantes_max,
            u'geo': {},
            u'participantes': [{} for _ in range(ActasConfig.participantes_min)],
            u'itemsGroups': [],  # TODO: Fix this
        }

        response = self.client.get(reverse('actas:base'))
        self.assertEquals(200, response.status_code)
        self.assertEquals(expected, response.json())
