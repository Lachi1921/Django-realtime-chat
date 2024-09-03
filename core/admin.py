from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Mute)
admin.site.register(Thread)
admin.site.register(Profile)
admin.site.register(Group)
admin.site.register(Social)
admin.site.register(Message)
admin.site.register(Files)
admin.site.register(NotificationSetting)