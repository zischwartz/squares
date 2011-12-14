from django.db import models

from pyfann import libfann
import settings

import log

from gather.models import Square, Checkin
nLAYERS = 4
nINPUTS = 4
nHIDDEN1 = 4
nHIDDEN2 = 3
nOUTPUTS = 1


def get_inputs(venue):
	inputs = []
	inputs.append(venue['stats']['checkinsCount'])
	inputs.append(venue['hereNow']['count'])
	inputs.append(venue['stats']['tipCount'])
	inputs.append(venue['createdAt'])
	return(inputs)


# Create your models here.

class Net(models.Model):
	square = models.ForeignKey(Square)

	def netFileName(self):
		return (settings.MEDIA_ROOT + 'nets/' + self.square.id + '.net').encode('ascii', 'ignore')

	def firstTrain(self, checkin):
		# train_data = libfann.training_data()
		ann = libfann.neural_net()
		# ann.create_standard(nLAYERS, nINPUTS, nHIDDEN1, nHIDDEN2, nOUTPUTS)
		ann.create_standard_array((nINPUTS, nHIDDEN1, nHIDDEN2, nOUTPUTS))
		log.info(checkin.get_inputs())
		ann.train(checkin.get_inputs(), [checkin.points])
		filename= self.netFileName()
		ann.save(filename)

	def doTrain(self, checkin):
		# train_data = libfann.training_data()
		ann = libfann.neural_net()
		filename= self.netFileName()
		ann.create_from_file(filename)
		ann.train(checkin.get_inputs(), [checkin.points])
		ann.save(filename)


	def execute(self, possible_venues):
		ann = libfann.neural_net()
		filename= self.netFileName()
		ann.create_from_file(filename)
		processed_venues=[]
		for v in possible_venues:
			log.info(v)
			score=ann.run(get_inputs(v))
			name= v['name']
			vid= v['id']
			processed_venues.append([name, score, vid])
		return processed_venues
		
from django.contrib import admin
admin.site.register(Net)
