from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.utils import simplejson

from models import *

# Create your views here.
def newData(request):
	if request.method == 'POST':
		# data = request.POST.copy()
		data = simplejson.loads(request.raw_post_data)

		if data['type']=='user':
			newUser, created= Square.objects.get_or_create(id=data['userId'], userName=data['userName'])
		
		if data['type']=='checkin':
			# json_data = simplejson.loads(request.raw_post_data)
			# return HttpResponse(data['venueData'])
			userSquare= Square.objects.get(id= data['userId'])
			# newCheckin = Checkin(square=userSquare)
			newCheckin = Checkin(square=userSquare, venueData=data['venueData'], checkinData = data['checkinData'])
			newCheckin.save()

		return HttpResponse('<b>nice post:</b><br>')

	if request.method == 'GET':
		return HttpResponse('nice get')


