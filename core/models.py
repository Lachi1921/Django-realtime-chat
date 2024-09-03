from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import os
# Create your models here.

def user_avatar_path(instance, filename):
    return f'avatar/{instance.user.username}s/{filename}'

def user_group_avatar_path(instance, filename):
    return f'group/avatar/{instance.owner.user.username}s/{filename}'

def user_message_file_path(instance, filename):
    return f'files/{instance.message.sender.user.username}s/{filename}'

def user_message_image_path(instance, filename):
    return f'images/{instance.message.sender.user.username}s/{filename}'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=user_avatar_path, default='images/placeholder.jpg')
    country = models.CharField(max_length=150, null=True, blank=True)
    phone = models.CharField(max_length=10, null=True, blank=True)
    bio = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.user.username}'s profile"
    
class Social(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE)
    twitter = models.CharField(max_length=300)
    facebook = models.CharField(max_length=300)
    instagram = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.user.user.username}'s profile socials"
    
class NotificationSetting(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE)
    message_notification = models.BooleanField(default=True)
    browser_notification = models.BooleanField(default=True)

    def __str__(self):
        return f"Notification settings for {self.user.user.username}"

class Group(models.Model):
    owner = models.ForeignKey(Profile, related_name="group_owner", on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=user_group_avatar_path, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    members = models.ManyToManyField(User, related_name="group_members")

    def __str__(self):
        return self.name

class Thread(models.Model):
    user1 = models.ForeignKey(Profile, related_name="thread_sender", on_delete=models.CASCADE)
    user2 = models.ForeignKey(Profile, related_name="thread_receiver", on_delete=models.CASCADE)

    def __str__(self):
        return f'Conversation between {self.user1}, {self.user2}'

class Message(models.Model):
    group = models.ForeignKey(Group, related_name="group_messages", on_delete=models.CASCADE, null=True, blank=True)
    thread = models.ForeignKey(Thread, related_name='messages', on_delete=models.CASCADE, null=True, blank=True)
    sender = models.ForeignKey(Profile, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Profile, related_name='received_messages', on_delete=models.CASCADE, null=True, blank=True)
    reply = models.ForeignKey('Message', related_name='reply_message', on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    is_deleted_by_sender = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.user.username}'s message"

class Mute(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    is_muted = models.BooleanField(default=False)
    muted_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"User {self.user} muted in Group {self.group} at {self.muted_at}"

class Files(models.Model):
    message = models.ForeignKey('Message', related_name="file_message", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    file_path = models.FileField(upload_to=user_message_file_path)
    image_path = models.FileField(upload_to=user_message_image_path)

    def __str__(self):
        return f'File for message {self.message.id}'
    
    def get_file_extention(self):
        extention = os.path.splitext(self.file_path.name)[1]
        return extention