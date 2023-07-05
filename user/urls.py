from django.urls import path
import user.views
from django.contrib.auth import views as auth_views

app_name = 'user'

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='user/login.html'), name='login'), 
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', user.views.signup, name='signup'),
]