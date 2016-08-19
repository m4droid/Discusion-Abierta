# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User


class Region(models.Model):
    nombre = models.CharField(max_length=128)
    iso_3166_2 = models.CharField(max_length=5)

    def __unicode__(self):
        return '{0:d} - {1:s}'.format(self.pk, self.nombre)

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
    descripcion = models.TextField(blank=True, null=True)
    orden = models.IntegerField()

    def __str__(self):
        return self.nombre.encode('utf-8')

    def to_dict(self):
        return {
            'pk': self.pk,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'items': [i.to_dict() for i in self.item_set.all().order_by('orden')]
        }


class Item(models.Model):
    grupo_items = models.ForeignKey(GrupoItems)
    nombre = models.CharField(max_length=256)
    orden = models.IntegerField()

    def __str__(self):
        return self.nombre.encode('utf-8')

    def to_dict(self):
        return {
            'pk': self.pk,
            'nombre': self.nombre,
        }


class Acta(models.Model):
    fecha = models.DateTimeField()
    comuna = models.ForeignKey(Comuna)

    participantes = models.ManyToManyField(User, related_name='participantes')
    memoria_historica = models.TextField(blank=True, null=True)


class ActaRespuestaItem(models.Model):
    CATEGORIA_OPCIONES = (
        ('Acuerdo', 1),
        ('Acuerdo parcial', 0),
        ('Desacuerdo', -1),
    )
    acta = models.ForeignKey(Acta)
    item = models.ForeignKey(Item)
    categoria = models.IntegerField(choices=CATEGORIA_OPCIONES)
    fundamento = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('acta', 'item')
