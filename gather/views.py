from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.utils import simplejson

import settings
from models import *

# Create your views here.
def newData(request):
	if request.method == 'POST':
		# data = request.POST.copy()
		data = simplejson.loads(request.raw_post_data)

		if data['type']=='user':
			newUser, created= Square.objects.get_or_create(id=data['userId'], userName=data['userName'])
			if not created:
				return HttpResponse('we know this square.')
			else:
				return HttpResponse('new user!')


		if data['type']=='checkin':
			cid = data['checkinData']['id']

			if not len(Checkin.objects.filter(id=cid)): 
				#it's a new checkin
				userSquare= Square.objects.get(id= data['userId'])
				newCheckin = Checkin(id= cid, square=userSquare, venueData=data['venueData'], checkinData = data['checkinData'])
				newCheckin.save()
				# return HttpResponse(newCheckin.get_inputs())
			else:
				return HttpResponse('you already checked in here')
		
		if data['type']=='activity':

			checkin = Checkin.objects.get(id=data['id'])
			checkin.points += int(data['points'])
			checkin.save()
			return HttpResponse('nice activity post yo')

		return HttpResponse('nice post')


	# if request.method == 'GET':
		# return HttpResponse(settings.MEDIA_ROOT)




