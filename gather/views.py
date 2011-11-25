from django.http import HttpResponse
from django.shortcuts import render_to_response

from models import *

# Create your views here.
def newData(request):
	if request.method == 'POST':
		data = request.POST.copy()

		newUser =Square(id=data['userId'], userName=data['userName'])
		newUser.save()
		return HttpResponse('nice post')

	if request.method == 'GET':
		return HttpResponse('nice get')


		