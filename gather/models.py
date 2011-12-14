from django.db import models
from jsonfield.fields import JSONField
import log

# Create your models here.

class Square(models.Model):
	id = models.CharField(max_length=255, primary_key=True)
	userName = models.CharField(max_length=255)
	points = models.IntegerField(default=0)

	def __unicode__(self):
		return self.userName +' - '+ self.id


def get_venue_inputs(self):
	inputs = []
	inputs.append(self['stats']['checkinsCount'])
	inputs.append(self['hereNow']['count'])
	inputs.append(self['tips']['count'])
	inputs.append(self['createdAt'])
	return(inputs)



class Checkin(models.Model):
	id = models.CharField(max_length=255, primary_key=True)
	checkinData = JSONField()
	venueData = JSONField()
	created= models.DateTimeField(auto_now_add=True)
	
	happyData = JSONField(default="", blank=True)
	points = models.IntegerField(default=0)

	square = models.ForeignKey(Square, null=True, blank=True)

	def __unicode__(self):
		return self.square.userName +' at '+ self.checkinData['venue']['name']

	def get_inputs(self):
		inputs = get_venue_inputs(self.venueData)
        # inputs = []
        # inputs.append(self.venueData['stats']['checkinsCount'])
        # inputs.append(self.venueData['hereNow']['count'])
        # inputs.append(self.venueData['tips']['count'])
        # inputs.append(self.venueData['createdAt'])
		return(inputs)
        





from django.contrib import admin
admin.site.register(Square)
admin.site.register(Checkin)