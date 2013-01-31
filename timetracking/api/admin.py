from django.contrib.auth.models import User
from api.models import *
from django.contrib import admin
from django import forms


class MyUserAdminForm(forms.ModelForm):

    class Meta:
        model = CustomUser

    def __init__(self, *args, **kwargs):
        super(MyUserAdminForm, self).__init__(*args, **kwargs)
        self.fields['password'].widget = forms.PasswordInput()

    def save(self, commit=True):
        user = super(MyUserAdminForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class MyUserAdmin(admin.ModelAdmin):
    form = MyUserAdminForm


admin.site.register(CustomUser, MyUserAdmin)
admin.site.register(Project)
admin.site.register(ProjectTime)
