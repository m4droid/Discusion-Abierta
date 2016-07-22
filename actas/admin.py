# -*- coding: utf-8 -*-
from django.contrib import admin

from .models import Item, GrupoItems


class GrupoItemsAdmin(admin.ModelAdmin):
    pass


class ItemAdmin(admin.ModelAdmin):
    pass


admin.site.register(GrupoItems, GrupoItemsAdmin)
admin.site.register(Item, ItemAdmin)
