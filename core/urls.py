from django.contrib.auth import views as auth_views
from django.urls import path
from .views import *

app_name = 'core'

urlpatterns = [
    path('', index, name="home"),
    path('sign-in/', auth_views.LoginView.as_view(template_name="signin.html", success_url='/'), name="login"),
    path('sign-out/', logout_view, name='logout'),
    path('sign-up/', register_view, name="register"),
    path('password-reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='custom_password_reset_confirm.html', success_url='/reset/done/'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='custom_password_reset_complete.html'), name='password_reset_complete'),
]
