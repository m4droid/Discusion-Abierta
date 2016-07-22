# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User


class Region(models.Model):
    nombre = models.CharField(max_length=128)
    iso_3166_2 = models.CharField(max_length=5)

    def __unicode__(self):
        return '{0:d} - {1:s}'.format(self.pk, self.name)

    class Meta:
        ordering = ['pk']


class Provincia(models.Model):
    nombre = models.CharField(max_length=128)
    region = models.ForeignKey(Region)

    def __unicode__(self):
        return '{0:s} - {1:s}'.format(self.region.nombre, self.nombre)


class Comuna(models.Model):
    nombre = models.CharField(max_length=128)
    provincia = models.ForeignKey(Provincia)

    def __unicode__(self):
        return '{0:s} - {1:s} - {2:s}'.format(
            self.provincia.region.nombre,
            self.provincia.nombre,
            self.nombre
        )


class GrupoItems(models.Model):
    nombre = models.CharField(max_length=128)
    descripcion = models.TextField()
    orden = models.IntegerField()


class Item(models.Model):
    grupo_items = models.ForeignKey(GrupoItems)
    nombre = models.CharField(max_length=256)
    orden = models.IntegerField()


class Acta(models.Model):
    fecha = models.DateTimeField()
    comuna = models.ForeignKey(Comuna)
    direccion = models.CharField(max_length=256)

    organizador = models.ForeignKey(User, related_name='organizador')
    # moderador = models.ForeignKey(User, related_name='moderador')
    # secretario = models.ForeignKey(User, related_name='secretario')
    participantes = models.ManyToManyField(User, related_name='participantes')
    memoria_historica = models.TextField()


class ActaRespuestaItem(models.Model):
    CATEGORIA_OPCIONES = (
        ('Acuerdo', 1),
        ('Acuerdo parcial', 0),
        ('Desacuerdo', -1),
    )
    acta = models.ForeignKey(Acta)
    item = models.ForeignKey(Item)
    categoria = models.IntegerField(choices=CATEGORIA_OPCIONES)
    fundamento = models.TextField()

    class Meta:
        unique_together = ('acta', 'item')
