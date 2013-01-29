from django.db import models
from django.contrib.auth.models import User
import json
# Create your models here.
class CustomUser(User):
    
    def to_json(self):
		return {
			"id": self.pk,
			"username": self.username,
			"email": self.email
		}

class Project(models.Model):
	name   = models.CharField(max_length=100)
	users  = models.ManyToManyField(CustomUser, related_name='u+')
	start  = models.DateField()
	finish = models.DateField()


	def __unicode__(self):
		return self.name

	def to_json(self):

		return {
			"id": self.id,	
			"name": self.name,
			"start": str(self.start),
			"finish": str(self.finish)
		}

class ProjectTime(models.Model):
	project = models.ForeignKey(Project)
	user    = models.ForeignKey(User)
	start   = models.DateTimeField(null=True)
	stop    = models.DateTimeField(null=True)

	def to_json(self):
		return {
			"id": self.pk,
			"project": self.project.name,
			"user": self.user.name,
			"start": str(self.start),
			"stop": str(self.stop)
		}

