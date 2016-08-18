# -*- coding: utf-8 -*-
from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from mock import patch


class ViewsSubirValidarTestCase(TestCase):

    def setup(self):
        self.client = Client()

    def test_post_invalid_method(self):
        expected = {u'status': u'error', u'mensajes': u'Request inválido.'}

        response = self.client.get(reverse('actas:validar'))
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())

    def test_post_empty_body(self):
        expected = {u'status': u'error', u'mensajes': u'Acta inválida.'}

        response = self.client.post(reverse('actas:validar'), {})
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())

    @patch('actas.libs.validar_datos_geograficos')
    def test_post_val_func_not_empty(self, mock_val_geo):
        mock_val_geo.side_effect = lambda *a: ['A']

        expected = {u'status': u'error', u'mensajes': [u'A']}

        response = self.client.post(reverse('actas:validar'), '{}', content_type="application/json")
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())

    @patch('actas.libs.validar_items')
    @patch('actas.libs.validar_participantes')
    @patch('actas.libs.validar_datos_geograficos')
    def test_post_ok(self, mock_val_geo, mock_val_participantes, mock_val_items):

        mock_val_geo.side_effect = lambda *a: []
        mock_val_participantes.side_effect = lambda *a: []
        mock_val_items.side_effect = lambda *a: []

        expected = {u'status': u'success', u'mensajes': [u'El acta ha sido validada exitosamente.']}

        response = self.client.post(reverse('actas:validar'), '{}', content_type="application/json")
        self.assertEquals(200, response.status_code)
        self.assertEquals(expected, response.json())
