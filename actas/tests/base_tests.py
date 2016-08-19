# -*- coding: utf-8 -*-
import os


def get_fixture_content(fixture_path):
    abs_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        'fixtures',
        fixture_path
    )

    with open(abs_path) as file_:
        content = file_.read()

    return content
