from api.models import *
from django.http import HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from datetime import datetime
# Create your views here.

@csrf_exempt
def do_login(request):
	try:
		user     = request.POST['username']
		password = request.POST['password']
		user = authenticate(username=user, password=password)
		if user is not None:
			if user.is_active:
				login(request, user)

				return HttpResponse(json.dumps({
					"erro": False,
					"data": {
						"name": user.first_name + ' ' + user.last_name,
						"email": user.email
					}
				}))
			else:
				return HttpResponse(json.dumps({
					"erro": True,
					"description": "User is not active"
				}))
		else:
			return HttpResponse(json.dumps({
				"erro": True,
				"description": "User or password incorrect"
			}))

	except (KeyError):
		return HttpResponse(json.dumps({
				"erro": True,
				"description": "Username and password are not sent" 
			}))

def get_projetos(request):
	if not request.user.is_authenticated():
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "User not logged in" 
							}))

	projects = Project.objects.filter(users__username__contains=request.user.username)
	return HttpResponse(json.dumps([p.to_json() for p in projects]))

def checkin(request, projeto_id):
	if not request.user.is_authenticated():
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "User not logged in" 
							}))
	try:
		project = Project.objects.get(pk=projeto_id)
	except:
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "Project not found" 
							}))

	#verifica se existe projeto pendente de checkout
	pending_checkout = ProjectTime.objects.filter(project=project, user=request.user, stop=None).count()

	if pending_checkout:
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "Project with pending checkout" 
							}))

	p = ProjectTime(project=project, user=request.user)
	p.start = datetime.now()
	p.save()

	return HttpResponse(json.dumps({
							"erro": False,
							"data": None 
						}))

def checkout(request, projeto_id):
	if not request.user.is_authenticated():
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "User not logged in" 
							}))
	try:
		project = Project.objects.get(pk=projeto_id)
	except:
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "Project not found" 
							}))

	try:
		#verifica se existe projeto pendente de checkout
		pending_checkout = ProjectTime.objects.get(project=project, user=request.user, stop=None)
		pending_checkout.stop = datetime.now()
		pending_checkout.save()
		return HttpResponse(json.dumps({
								"erro": False,
								"data": None
							}))
	except:
		return HttpResponse(json.dumps({
								"erro": True,
								"description": "Project doesn't have any checkin" 
							}))

