# Create your views here.

from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.utils import simplejson

import log

import settings
from models import *

from gather.models import *


def train(request, id):
	checkin = get_object_or_404(Checkin, id=id)
        
        checkin.square.points+=checkin.points
        checkin.square.save()

        net, created= Net.objects.get_or_create(square=checkin.square)
	if created:
		log.info('created')
		net.firstTrain(checkin)
	else:
		net.doTrain(checkin)
		log.info('already existed')
		
	return HttpResponse(id)
	
def choose(request, id):
	# if request.method == 'POST':
	items = simplejson.loads(request.raw_post_data)
	# log.info("ITEMSSSS")
	# log.info(items)
	square = Square.objects.get(id=id)
	# net = Net.objects.get(square=square)
	net = get_object_or_404(Net, square= square) 
        if net.exists:
            processed_venues= net.execute(items)
        else:
            return  HttpResponse("Here's the text of the Web page.")
        # processed_venues= net.execute(items)
	return HttpResponse(simplejson.dumps(processed_venues))
