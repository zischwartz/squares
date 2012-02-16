from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template


urlpatterns = patterns('learn.views',
    url(r'^train/(?P<id>.*)$', 'train'),
    url(r'^choose/(?P<id>.*)$', 'choose'),
    url(r'^getvisdata/(?P<id>.*)$', 'getVisData'),
)


