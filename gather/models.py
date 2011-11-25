from django.db import models

# Create your models here.

class Square(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    userName = models.CharField(max_length=255)


from django.contrib import admin
admin.site.register(Square)