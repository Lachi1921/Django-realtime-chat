from django.shortcuts import redirect


def anonymous_required(function, redirect_url="core:home"):
    """
    Decorator for views that checks that if the user is anonymous, redirecting
    to the home page if necessary.
    """
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(redirect_url)
        else:
            return function(request, *args, **kwargs)
    return wrap