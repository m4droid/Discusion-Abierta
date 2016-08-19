# -*- coding: utf-8 -*-
from django.test import TestCase

from ..apps import ActasConfig


class AppTestCase(TestCase):

    def test_get_name(self):
        self.assertEquals('actas', ActasConfig.name)
