from django import template
from core.models import Mute
register = template.Library()

@register.filter
def is_muted(group, user):
    return Mute.objects.filter(group=group, user=user, is_muted=True).exists()
