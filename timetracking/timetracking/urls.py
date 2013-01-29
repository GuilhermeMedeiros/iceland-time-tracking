from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),

    #API
    url(r'^api/login', 'api.views.do_login'),
    url(r'^api/logout', 'api.views.do_logout'),
    url(r'^api/get_projetos', 'api.views.get_projetos'),
    url(r'^api/projeto/(?P<projeto_id>\d+)/checkin', 'api.views.checkin'),
    url(r'^api/projeto/(?P<projeto_id>\d+)/checkout', 'api.views.checkout'),
)
