# -*- coding: utf-8 -*-
from django.test import TestCase, Client
from django.core.urlresolvers import reverse


class ViewsActaIndexTestCase(TestCase):

    def setup(self):
        self.client = Client()

    def test_obtener_index(self):
        response = self.client.get(reverse('actas:index'))
        self.assertEquals(200, response.status_code)
