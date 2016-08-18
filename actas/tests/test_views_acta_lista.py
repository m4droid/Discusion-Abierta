# -*- coding: utf-8 -*-
from django.test import TestCase, Client
from django.core.urlresolvers import reverse


class ViewsActaListaTestCase(TestCase):

    def setup(self):
        self.client = Client()

    def test_obtener_lista(self):
        response = self.client.get(reverse('actas:lista'))
        self.assertEquals(200, response.status_code)
