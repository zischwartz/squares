from django.db import models

from pyfann import libfann
import settings

import sys, subprocess

import log

import common

from gather.models import Square, Checkin
nLAYERS = 4
nINPUTS = 3
# nINPUTS = 4
nHIDDEN1 = 4
nHIDDEN2 = 3
nOUTPUTS = 1

# this was factored out to: common.py
# def get_inputs(venue):
# 	inputs = []
# 	inputs.append(venue['stats']['checkinsCount'])
# 	inputs.append(venue['hereNow']['count'])
# 	inputs.append(venue['stats']['tipCount'])
# 	return(inputs)
# 

# Create your models here.

class Net(models.Model):
	square = models.ForeignKey(Square)
        visualization = models.TextField(default=" ")
	exists = models.BooleanField(default=False)

        def netFileName(self):
		return (settings.MEDIA_ROOT + 'nets/' + self.square.id + '.net').encode('ascii', 'ignore')

	def firstTrain(self, checkin):
		# train_data = libfann.training_data()
		ann = libfann.neural_net()
		# ann.create_standard(nLAYERS, nINPUTS, nHIDDEN1, nHIDDEN2, nOUTPUTS)
		ann.create_standard_array((nINPUTS, nHIDDEN1, nHIDDEN2, nOUTPUTS))
		# log.info(checkin.get_inputs())
		ann.train(checkin.get_inputs(), [checkin.points])
		filename= self.netFileName()
		ann.save(filename)

	def doTrain(self, checkin):
		# train_data = libfann.training_data()
		ann = libfann.neural_net()
		filename= self.netFileName()
		ann.create_from_file(filename)
		ann.train(checkin.get_inputs(), [checkin.points])
                
                # print sys.path
                script = sys.path[0] + '/get_vis.py'
                process = subprocess.Popen(["python", script, filename], stdout=subprocess.PIPE)
                result = process.communicate()[0]
                self.visualization = result
                print result

                # print 'pre redirect'
                # old_stdout = sys.stdout
                # silly = common.sillystring()
                # sys.stdout = silly
                # print 'post redirect'
                # ann.print_connections()
                # self.visualization = silly.content
                                
                ann.save(filename)
                self.exists = True
                self.save()
		# sys.stdout = old_stdout
                # print 'after save'

	def execute(self, possible_venues):
                if not self.exists:
                    return 'The net does not exist yet, stop trying to execute it'
                ann = libfann.neural_net()
		filename= self.netFileName()
		ann.create_from_file(filename)
		processed_venues=[]
		for v in possible_venues:
			log.info(v)
			score=ann.run(common.get_inputs(v))[0]
			name= v['name']
			vid= v['id']
			processed_venues.append([name, score, vid])
                return processed_venues
		
from django.contrib import admin
admin.site.register(Net)
