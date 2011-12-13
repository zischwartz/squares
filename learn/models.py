from django.db import models

from pyfann import libfann
import settings

from gather.models import Square, Checkin
nLAYERS = 4
nINPUTS = 4
nHIDDEN1 = 4
nHIDDEN2 = 3
nOUTPUTS = 1

# Create your models here.


class Net(models.Model):
	square = models.ForeignKey(Square)

	def netFileName(self):
		return settings.MEDIA_ROOT + 'nets/' + self.square.id + '.net'

	def firstTrain(self, checkin):
		# train_data = libfann.training_data()
		ann = libfann.neural_net()
		ann.create_standard(nLAYERS, nINPUTS, nHIDDEN1, nHIDDEN2, nOUTPUTS)
		ann.train(checkin.get_inputs(), checkin.points)
		ann.save(self.netFileName())

	def execute(self, possible_venues):
		return 'hi'
        
        
from django.contrib import admin
admin.site.register(Net)
