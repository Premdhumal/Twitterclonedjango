from django.contrib import admin
from .models import Tweet, UserProfile, Like, Notification

admin.site.register(Tweet)
admin.site.register(UserProfile)
admin.site.register(Like)
admin.site.register(Notification)