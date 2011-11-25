from django.db import models
from jsonfield.fields import JSONField

# Create your models here.

class Square(models.Model):
	id = models.CharField(max_length=255, primary_key=True)
	userName = models.CharField(max_length=255)
	points = models.IntegerField(default=0)

	def __unicode__(self):
		return self.userName +' - '+ self.id

class Checkin(models.Model):
	id = models.CharField(max_length=255, primary_key=True)
	checkinData = JSONField()
	venueData = JSONField()
	created= models.DateTimeField(auto_now_add=True)
	
	happyData = JSONField(default="", blank=True)
	points = models.IntegerField(default=0)

	square = models.ForeignKey(Square, null=True, blank=True)




from django.contrib import admin
admin.site.register(Square)
admin.site.register(Checkin)