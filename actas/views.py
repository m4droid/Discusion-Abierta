# -*- coding: utf-8 -*-
import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.datetime_safe import date
from actas.models import Acta, Item, Comuna, ActaRespuestaItem


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

    acta['itemsGroups'] = [
        {
            'nombre': 'EDUCACIÓN PÚBLICA',
            'descripcion': '¿Cuáles son los VALORES Y PRINCIPIOS más importantes que deben inspirar y dar sustento a la educación pública?',
            'items': [
                {'nombre': 'Principio A'},
                {'nombre': 'Principio B'},
                {'nombre': 'Principio C'},
            ]
        },
        {
            'nombre': 'DERECHOS',
            'descripcion': '¿Cuáles son los DERECHOS más importantes que la educación pública debiera establecer para todas las personas?',
            'items': [
                {'nombre': 'Principio D'},
                {'nombre': 'Principio E'},
                {'nombre': 'Principio F'},
            ]
        }
    ]
    return JsonResponse(acta)


def subir_data(request):
    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        geo = body['geo']
        comuna = geo['comuna']
        comuna_key = comuna['pk']
        comuna_value = Comuna.objects.get(pk=comuna_key)
        direccion = geo['direccion']
        memoria_historica = "x"
        user = User.objects.all().first()
        acta = Acta(comuna=comuna_value, direccion=direccion, memoria_historica=memoria_historica,fecha=date.today(),organizador = user)
        acta.save()
        item_group = body['itemsGroups']

        for group in item_group:
            for i in group['items']:
                actaitem = ActaRespuestaItem(acta =acta, item= i['nombre'],categoria=i['categoria'],fundamento= i['fundamento'])
                actaitem.save()
    return JsonResponse({})
