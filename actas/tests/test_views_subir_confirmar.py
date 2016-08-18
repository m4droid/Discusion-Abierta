# -*- coding: utf-8 -*-
from django.test import TestCase, Client
from django.core.urlresolvers import reverse
from mock import patch


class ViewsSubirConfirmarTestCase(TestCase):

    def setup(self):
        self.client = Client()

    def test_post_invalid_method(self):
        expected = {u'status': u'error', u'mensajes': u'Request inválido.'}

        response = self.client.get(reverse('actas:confirmar'))
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())

    def test_post_empty_body(self):
        expected = {u'status': u'error', u'mensajes': u'Acta inválida.'}

        response = self.client.post(reverse('actas:confirmar'), {})
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())

    @patch('actas.libs.validar_datos_geograficos')
    def test_post_val_func_not_empty(self, mock_val_geo):
        mock_val_geo.side_effect = lambda *a: ['A']

        expected = {u'status': u'error', u'mensajes': [u'A']}

        response = self.client.post(reverse('actas:confirmar'), '{}', content_type="application/json")
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())

    @patch('actas.views.guardar_acta')
    @patch('actas.views.validar_cedulas_participantes')
    @patch('actas.views.validar_acta_json')
    def test_post_ok(self, mock_val_acta, mock_val_cedulas, mock_guardar_acta):

        mock_val_acta.side_effect = lambda *a: (None, [])
        mock_val_cedulas.side_effect = lambda *a: []
        mock_guardar_acta.side_effect = lambda *a: None

        expected = {u'status': u'success', u'mensajes': [u'El acta ha sido ingresada exitosamente.']}

        response = self.client.post(reverse('actas:confirmar'), '{}', content_type="application/json")
        self.assertEquals(200, response.status_code)
        self.assertEquals(expected, response.json())

    @patch('actas.views.validar_cedulas_participantes')
    @patch('actas.views.validar_acta_json')
    def test_post_error_cedulas(self, mock_val_acta, mock_val_cedulas):

        mock_val_acta.side_effect = lambda *a: (None, [])
        mock_val_cedulas.side_effect = lambda *a: ['A']

        expected = {u'status': u'error', u'mensajes': [u'A']}

        response = self.client.post(reverse('actas:confirmar'), '{}', content_type="application/json")
        self.assertEquals(400, response.status_code)
        self.assertEquals(expected, response.json())
