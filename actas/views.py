# -*- coding: utf-8 -*-
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from .libs import validar_acta_json, validar_cedulas_participantes, guardar_acta, obtener_config

from .models import GrupoItems


def index(request):
    return render(request, 'index.html')


def lista(request):
    return render(request, 'lista.html')


@ensure_csrf_cookie
def subir(request):
    return render(request, 'subir.html')


def acta_base(request):

    config = obtener_config()

    acta = {
        'min_participantes': config['participantes_min'],
        'max_participantes': config['participantes_max'],
        'geo': {},
        'participantes': [{} for _ in range(config['participantes_min'])]
    }

    acta['itemsGroups'] = [g.to_dict() for g in GrupoItems.objects.all().order_by('orden')]

    return JsonResponse(acta)


@transaction.atomic
def subir_validar(request):
    acta, errores = validar_acta_json(request)

    if len(errores) > 0:
        return JsonResponse({'status': 'error', 'mensajes': errores}, status=400)

    return JsonResponse({'status': 'success', 'mensajes': ['El acta ha sido validada exitosamente.']})


@transaction.atomic
def subir_confirmar(request):
    acta, errores = validar_acta_json(request)

    if len(errores) > 0:
        return JsonResponse({'status': 'error', 'mensajes': errores}, status=400)

    errores = validar_cedulas_participantes(acta)

    if len(errores) == 0:
        guardar_acta(acta)
        return JsonResponse({'status': 'success', 'mensajes': ['El acta ha sido ingresada exitosamente.']})

    return JsonResponse({'status': 'error', 'mensajes': errores}, status=400)
