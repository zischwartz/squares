# Create your views here.

from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.utils import simplejson


import settings
from models import *

from gather.models import *

def train(request, id):
	checkin = get_object_or_404(Checkin, id=id)
	newNet, created= Net.objects.get_or_create(square=checkin.square)

	newNet.firstTrain(checkin);
	
	return HttpResponse(id)