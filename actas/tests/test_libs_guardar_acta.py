# -*- coding: utf-8 -*-
from django.test.testcases import TransactionTestCase
from django.contrib.auth.models import User

from ..libs import guardar_acta
from ..models import Item, Acta, ActaRespuestaItem


class LibsGuardarActaTestCase(TransactionTestCase):

    fixtures = [
        'regiones.json',
        'provincias.json',
        'comunas.json',
        'test_users.json',
        'test_grupoitems.json',
        'test_items.json',
        'test_actas.json',
        'test_actasrespuestasitems.json',
    ]

    def test_guardar(self):
        datos_acta = {
            'geo': {
                'region': 13,
                'provincia': 131,
                'comuna': 13101
            },
            'participantes': [
                {'rut': '2-7', 'nombre': 'Aa', 'apellido': 'Bb'},
            ],
            'itemsGroups': [
                {
                    'items': [
                        {'pk': 1, 'nombre': 'C', 'categoria': '0', 'fundamento': 'Porque sí.'},
                    ]
                },
            ],
            'memoria': 'Z'
        }
        guardar_acta(datos_acta)

        # Participante guardado como usuario
        participantes = User.objects.prefetch_related('participantes').filter(
            username=datos_acta['participantes'][0]['rut']
        )
        self.assertEquals(1, len(participantes))

        # Acta
        actas = Acta.objects.filter(participantes__in=participantes)
        self.assertEquals(1, len(actas))

        # Datos geograficos
        self.assertEquals(13101, actas[0].comuna.pk)

        # Participante en acta
        self.assertIn(participantes[0], actas[0].participantes.all())

        # Respuestas
        items_por_responder = map(lambda i: i.pk, Item.objects.all())
        for group in datos_acta['itemsGroups']:
            for item in group['items']:
                respuesta = ActaRespuestaItem.objects.get(acta=actas[0], item=item['pk'])
                self.assertEquals(int(item['categoria']), respuesta.categoria)
                self.assertEquals(item['fundamento'].decode('utf-8'), respuesta.fundamento)
                items_por_responder.remove(respuesta.item.pk)
        self.assertEquals(0, len(items_por_responder))

        # Memoria
        self.assertEquals(datos_acta['memoria'], actas[0].memoria_historica)
