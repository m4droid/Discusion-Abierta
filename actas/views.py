# -*- coding: utf-8 -*-
from django.http import JsonResponse
from django.shortcuts import render


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
    return JsonResponse({})
