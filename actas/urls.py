from django.conf.urls import url

from .views import index, lista, acta_base, subir, subir_validar, subir_confirmar


urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'^lista$', lista, name='lista'),
    url(r'^base$', acta_base, name='base'),
    url(r'^subir/$', subir, name='subir'),
    url(r'^subir/validar$', subir_validar, name='validar'),
    url(r'^subir/confirmar$', subir_confirmar, name='confirmar'),
]
