# -*- coding: utf-8 -*-
from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from .libs import validar_acta_json, validar_cedulas_participantes, guardar_acta

from .models import GrupoItems


def index(request):
    return render(request, 'index.html')


def lista(request):
    return render(request, 'lista.html')


@ensure_csrf_cookie
def subir(request):
    return render(request, 'subir.html')


def acta_base(request):

    participantes_min = 4
    participantes_max = 10

    if hasattr(settings, 'DISCUSION_ABIERTA') and type(settings.DISCUSION_ABIERTA) == dict:
        participantes_min = int(settings.DISCUSION_ABIERTA.get('PARTICIPANTES_MIN', participantes_min))
        participantes_max = int(settings.DISCUSION_ABIERTA.get('PARTICIPANTES_MAX', participantes_max))

    acta = {
        'min_participantes': participantes_min,
        'max_participantes': participantes_max,
        'geo': {},
        'participantes': [{} for _ in range(participantes_min)]
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
