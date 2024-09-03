from django import template
from django.db.models import Q
from core.models import Thread

register = template.Library()

@register.simple_tag
def get_conversation(user1, user2):
    return Thread.objects.filter(Q(users__user__username=user1) & Q(users__user__username=user2))