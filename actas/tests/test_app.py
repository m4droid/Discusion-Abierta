# -*- coding: utf-8 -*-
from django.apps import apps
from django.test import TestCase
from django.test.utils import override_settings


class AppTestCase(TestCase):

    def tearDown(self):
        apps.clear_cache()

    def test_get_name(self):
        with override_settings(INSTALLED_APPS=['actas']):
            self.assertEquals('actas', apps.get_app_config('actas').name)
