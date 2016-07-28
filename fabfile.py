# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import re

from fabric.api import env, run
from fabric.colors import yellow
from fabric.context_managers import cd, shell_env
from fabric.operations import sudo


GIT_REPO = {
    'url': 'git@github.com:m4droid/Discusion-Abierta.git',
    'name': 'Discusion-Abierta'
}


def development():
    env.hosts = ['discusion.m4droid.com']
    env.user = 'ubuntu'
    env.deploy_user = 'discusion'
    env.branch = 'develop'
    env.home = '/home/{0:s}'.format(env.deploy_user)
    env.python_env = '{0:s}/pyenv'.format(env.home)
    env.migrate_db = True


def deploy():
    install_packages()
    prepare_environment()
    repo_update()
    repo_activate_version()
    install_dependencies()
    bower_install()
    django_migrate_db()
    django_collect_static()
    restart_services()


def install_packages():
    print yellow('\nInstalling system packages')
    sudo('aptitude -y install build-essential python-dev python-pip python-virtualenv libxml2-dev libxslt1-dev git-core postgresql-server-dev-all gunicorn nginx-full libffi-dev libssl-dev')


def prepare_environment():
    print(yellow('\nPreparing environment'))
    with shell_env(HOME=env.home), cd(env.home):
        sudo('mkdir -p repos logs', user=env.deploy_user)
        sudo(
            '[ ! -d pyenv ] && virtualenv {0:s} || echo "Python environment already exists"'.format(env.python_env),
            user=env.deploy_user
        )
        sudo('{0:s}/bin/pip install -U pip'.format(env.python_env), user=env.deploy_user)
        _install_gunicorn()


def repo_update():
    print(yellow('\nUpdate repository'))
    with shell_env(HOME=env.home), cd('{0:s}/repos'.format(env.home)):
        sudo(
            '[ ! -d {name:s} ] && git clone {url:s} {name:s} || (cd {name:s} && git pull)'.format(**GIT_REPO),
            user=env.deploy_user
        )


def repo_activate_version():
    print(yellow('\nActivating repository version'))
    with shell_env(HOME=env.home), cd('{0:s}/repos/{1:s}'.format(env.home, GIT_REPO['name'])):
        sudo(
            'git checkout {0:s}'.format(env.branch),
            user=env.deploy_user
        )


def install_dependencies():
    print(yellow('\nInstalling dependencies'))
    with shell_env(HOME=env.home), cd('{0:s}/repos/{1:s}'.format(env.home, GIT_REPO['name'])):
        sudo('{0:s}/bin/pip install -r requirements.txt'.format(env.python_env), user=env.deploy_user)


def bower_install():
    print(yellow('\nInstalling Bower dependencies'))
    with shell_env(HOME=env.home), cd('{0:s}/repos/{1:s}'.format(env.home, GIT_REPO['name'])):
        sudo('bower --config.interactive=false cache clean', user=env.deploy_user)
        sudo('bower --config.interactive=false install', user=env.deploy_user)


def django_migrate_db():
    if not env.migrate_db:
        return

    print yellow('\nDjango migrate DB')
    with shell_env(HOME=env.home), cd('{0:s}/repos/{1:s}'.format(env.home, GIT_REPO['name'])):
        sudo('{0:s}/bin/python manage.py migrate'.format(env.python_env), user=env.deploy_user)


def django_collect_static():
    print yellow('\Django collect static')
    with shell_env(HOME=env.home), cd('{0:s}/repos/{1:s}'.format(env.home, GIT_REPO['name'])):
        sudo('{0:s}/bin/python manage.py collectstatic --noinput'.format(env.python_env), user=env.deploy_user)


def restart_services():
    print(yellow('\nRestarting services'))
    sudo('service gunicorn restart', pty=False)


def _install_gunicorn():
    gunicorn_version = run('gunicorn --version')
    gunicorn_version = re.sub('[^0-9\.]', '', gunicorn_version)
    sudo(
        '{0:s}/bin/pip install -U gunicorn=={1:s}'.format(env.python_env, gunicorn_version),
        user=env.deploy_user
    )
