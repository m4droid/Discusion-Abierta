# -*- coding: utf-8 -*-
import json

from django.contrib.auth.models import User
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone

from .libs import verificar_rut
from .models import Comuna, Acta, Item, GrupoItems, ActaRespuestaItem


def index(request):
    return render(request, 'index.html')


def lista(request):
    return render(request, 'lista.html')


def subir(request):
    return render(request, 'subir.html')


def obtener_base(request):
    acta = {
        'geo': {},
        'organizador': {},
        'participantes': [{}, {}, {}, {}]
    }

    acta['itemsGroups'] = [g.to_dict() for g in GrupoItems.objects.all().order_by('orden')]

    return JsonResponse(acta)


def _validar_datos_geograficos(acta):
    errores = []

    comuna_seleccionada = acta.get('geo', {}).get('comuna')
    provincia_seleccionada = acta.get('geo', {}).get('provincia')
    region_seleccionada = acta.get('geo', {}).get('region')

    direccion = acta.get('geo', {}).get('direccion')

    if type(direccion) not in [str, unicode] or len(direccion) < 5:
        return ['Dirección inválida']

    if type(region_seleccionada) != dict:
        return ['Región inválida']

    if type(provincia_seleccionada) != dict:
        return ['Provincia inválida']

    if type(comuna_seleccionada) != dict:
        return ['Comuna inválida']

    comunas = Comuna.objects.filter(pk=comuna_seleccionada['pk'])

    if len(comunas) != 1:
        errores.append('Comuna inválida.')
    else:
        if comunas[0].provincia.pk != provincia_seleccionada['pk']:
            errores.append('Provincia no corresponde a la comuna.')

        if comunas[0].provincia.region.pk != region_seleccionada['pk']:
            errores.append('Región no corresponde a la provincia.')

    return errores


def _validar_participante(participante, pos):
    errores = []

    if not verificar_rut(participante.get('rut')):
        errores.append('RUT del participante {0:d} es inválido.'.format(pos))

    nombre = participante.get('nombre')
    apellido = participante.get('apellido')

    if type(nombre) not in [str, unicode] or len(nombre) < 2:
        errores.append('Nombre del participante {0:d} es inválido.'.format(pos))

    if type(apellido) not in [str, unicode] or len(apellido) < 2:
        errores.append('Apellido del participante {0:d} es inválido.'.format(pos))

    return errores


def _validar_participantes(acta):
    errores = []

    participantes = acta.get('participantes', [])

    if type(participantes) != list or not (4 <= len(participantes) <= 10):
        errores.append('Error en el formato de los participantes.')
        return errores

    for i, participante in enumerate(participantes):
        errores += _validar_participante(participante, i + 1)

    if len(errores) > 0:
        return errores

    rut_organizador = acta.get('organizador', {}).get('rut')

    if not verificar_rut(rut_organizador):
        return ['El RUT del organizador no es válido']

    ruts_participantes = [p['rut'] for p in participantes]

    if rut_organizador in ruts_participantes:
        return ['El organizador está dentro de la lista de participantes.']

    # Ruts diferentes
    ruts = set(ruts_participantes + [rut_organizador])
    if not (5 <= len(ruts) <= 11):
        return ['Existen RUTs repetidos']

    # Nombres diferentes
    nombres = set(
        (p['nombre'].lower(), p['apellido'].lower(), ) for p in (participantes + [acta['organizador']])
    )
    if not (5 <= len(nombres) <= 11):
        return ['Existen nombres repetidos']

    # Verificar que los participantes no hayan enviado una acta antes
    participantes_en_db = User.objects.filter(username__in=list(ruts))

    if len(participantes_en_db) > 0:
        for participante in participantes_en_db:
            errores.append('El RUT {0:s} ya participó del proceso.'.format(participante.username))

    return errores


def _validar_items(acta):
    errores = []

    # TODO: Validar todos los items por DB

    for group in acta['itemsGroups']:
        for i, item in enumerate(group['items']):
            acta_item = Item.objects.filter(pk=item.get('pk'))

            if len(acta_item) != 1 or acta_item[0].nombre != item.get('nombre'):
                errores.append(
                    'Existen errores de validación en ítem {0:s} del grupo {1:s}.'.format(
                        item.get('nombre').encode('utf-8'),
                        group.get('nombre').encode('utf-8')
                    )
                )

            if item.get('categoria') not in ['-1', '0', '1']:
                errores.append(
                    'No se ha seleccionado la categoría del ítem {0:s}, del grupo {1:s}.'.format(
                        item.get('nombre').encode('utf-8'),
                        group.get('nombre').encode('utf-8')
                    )
                )

    return errores


def _crear_usuario(datos_usuario):
    usuario = User(username=datos_usuario['rut'])
    usuario.first_name = datos_usuario['nombre']
    usuario.last_name = datos_usuario['apellido']
    usuario.save()
    return usuario


def _guardar_acta(datos_acta):
    organizador = _crear_usuario(datos_acta['organizador'])

    acta = Acta(
        comuna=Comuna.objects.get(pk=datos_acta['geo']['comuna']['pk']),
        direccion=datos_acta['geo']['direccion'],
        organizador=organizador,
        memoria_historica=datos_acta.get('memoria'),
        fecha=timezone.now(),
    )

    acta.save()

    for p in datos_acta['participantes']:
        acta.participantes.add(_crear_usuario(p))

    acta.save()

    for group in datos_acta['itemsGroups']:
        for i in group['items']:
            item = Item.objects.get(pk=i['pk'])
            acta_item = ActaRespuestaItem(
                acta=acta,
                item=item,
                categoria=i['categoria'],
                fundamento=i.get('fundamento')
            )
            acta_item.save()


@transaction.atomic
def subir_data(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'mensajes': ['Request inválido.']}, status=400)

    acta = request.body.decode('utf-8')
    acta = json.loads(acta)

    for e in [_validar_datos_geograficos(acta), _validar_participantes(acta), _validar_items(acta)]:
        if len(e) > 0:
            return JsonResponse({'status': 'error', 'mensajes': e}, status=400)

    _guardar_acta(acta)

    return JsonResponse({'status': 'success', 'mensajes': ['El acta ha sido ingresada con éxito.']})
