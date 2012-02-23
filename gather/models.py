from django.db import models
from jsonfield.fields import JSONField
import log

import common

# from learn.models import get_inputs
# Create your models here.

class Square(models.Model):
	id = models.CharField(max_length=255, primary_key=True)
	userName = models.CharField(max_length=255)
	points = models.FloatField(default=0)
        
        lastPoints= models.FloatField(default=0)
        lastInputs= JSONField(default="", blank=True)
        averageInputs= JSONField(default="", blank=True)

	def __unicode__(self):
		return self.userName +' - '+ self.id

        #send vis stuff, based on each input, averaged, maybe weighted by how much fun it had
        # average of tipCount, and if it went up or down at the last checkin
        #alpha/lum for sadness?
        # 
        # for each input, send fred average, between 0 and 1, and -1 for dropping and 1 for rising
        # and squares hapiness and -1 to 1 for change
        # maybe the last two checkins

        # fred says
        # most recent checkin and average, scaled

class Checkin(models.Model):
	id = models.CharField(max_length=255, primary_key=True)
	checkinData = JSONField()
	venueData = JSONField()
	created= models.DateTimeField(auto_now_add=True)
	
	inputs = JSONField(default="", blank=True)
	points = models.FloatField(default=0)

	square = models.ForeignKey(Square, null=True, blank=True)

	def __unicode__(self):
		return self.square.userName +' at '+ self.checkinData['venue']['name']

	def get_inputs(self):
                inputs = common.get_inputs(self.venueData)
                return(inputs)
        

from django.contrib import admin
admin.site.register(Square)
admin.site.register(Checkin)
