from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

import settings


urlpatterns = patterns('',
    (r'^$',  direct_to_template, {'template': 'index.html'}),
    (r'^home/$',  direct_to_template, {'template': 'index.html'}),
    url(r'^data/', include('gather.urls')),

    # Examples:
    # url(r'^$', 'squares.views.home', name='home'),
    # url(r'^squares/', include('squares.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)


if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.STATICFILES_DIRS,
        }),
   )