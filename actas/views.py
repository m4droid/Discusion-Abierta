# -*- coding: utf-8 -*-
from django.shortcuts import render


def index(request):
    return render(request, 'index.html')


def lista(request):
    return render(request, 'lista.html')


def subir(request):
    return render(request, 'subir.html')
