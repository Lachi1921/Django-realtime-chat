from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        Social.objects.create(user=instance.profile)
        NotificationSetting.objects.create(user=instance.profile)
        
        existing_profiles = Profile.objects.exclude(user=instance)
        for existing_profile in existing_profiles:
            Thread.objects.get_or_create(user1=instance.profile, user2=existing_profile)
