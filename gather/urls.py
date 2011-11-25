from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template


urlpatterns = patterns('gather.views',
    url(r'^$', 'newData'),
)