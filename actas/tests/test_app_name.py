# -*- coding: utf-8 -*-
from django.test import TestCase

from ..apps import ActasConfig


class AppTestCase(TestCase):

    def test_get_name(self):
        self.assertEquals('actas', ActasConfig.name)
        self.assertEquals(4, ActasConfig.participantes_min)
        self.assertEquals(10, ActasConfig.participantes_max)
